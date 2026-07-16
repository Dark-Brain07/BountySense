# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

"""
BountySense — The Decentralized Web3 Security Auditor on GenLayer.

An intelligent bug bounty platform where developers lock GEN tokens as a reward for finding vulnerabilities. Security researchers (hunters) submit their exploit proof (as a URL to a gist or report). GenLayer's AI-validator consensus reads the project scope and the submitted bug report, evaluates if the zero-day exploit is technically valid, and if approved, automatically awards the bounty to the whitehat hacker.

This completely removes the need for trusted third-party auditors or manual triage!
"""

from genlayer import *
from dataclasses import dataclass
import json
import re

ERROR_EXPECTED = "[EXPECTED]"
ERROR_EXTERNAL = "[EXTERNAL]"
ERROR_TRANSIENT = "[TRANSIENT]"
ERROR_LLM = "[LLM_ERROR]"

MAX_BODY_BYTES = 24_000
MAX_FIELD_CHARS = 4_000

_INJECTION_TOKENS = (
    "ignore previous", "ignore all previous", "disregard previous",
    "disregard above", "system override", "<system", "</system",
    "you are now", "new instructions", "forget everything",
    "override scoring", "force output", "act as",
)

def _sanitize(text: str) -> str:
    if not isinstance(text, str):
        text = str(text)
    text = "".join(ch for ch in text if ch == "\n" or ch == "\t" or ord(ch) >= 32)
    if len(text) > MAX_FIELD_CHARS:
        text = text[:MAX_FIELD_CHARS] + " ...[truncated]"
    low = text.lower()
    flags = [tok for tok in _INJECTION_TOKENS if tok in low]
    if flags:
        text = "[INJECTION_FLAGGED] " + text
    return text

def _clean_json(raw: str) -> dict:
    if isinstance(raw, dict):
        return raw
    s = str(raw).strip()
    first = s.find("{")
    last = s.rfind("}")
    if first == -1 or last == -1 or last < first:
        raise gl.vm.UserError(f"{ERROR_LLM} no JSON object in response")
    s = s[first:last + 1]
    s = re.sub(r",(?!\s*?[\{\[\"\'\w])", "", s)
    try:
        return json.loads(s)
    except Exception:
        raise gl.vm.UserError(f"{ERROR_LLM} malformed JSON in response")

def _assess(url: str, description: str) -> dict:
    resp = gl.nondet.web.get(url, headers={"Accept": "text/plain,application/json"})
    status = resp.status
    if 400 <= status < 500:
        raise gl.vm.UserError(f"{ERROR_EXTERNAL} telemetry endpoint returned {status}")
    if status >= 500:
        raise gl.vm.UserError(f"{ERROR_TRANSIENT} telemetry endpoint returned {status}")
    if status != 200:
        raise gl.vm.UserError(f"{ERROR_EXTERNAL} unexpected telemetry status {status}")

    body = resp.body or b""
    if isinstance(body, str):
        body = body.encode("utf-8")
    if len(body) > MAX_BODY_BYTES:
        body = body[:MAX_BODY_BYTES]
    telemetry = _sanitize(body.decode("utf-8", "replace"))
    desc = _sanitize(description)

    prompt = (
        "<role>\n"
        "You are an Elite Web3 Security Auditor AI operating inside a GenLayer decentralized consensus thread. "
        "You are responsible for evaluating zero-day bug reports and vulnerability disclosures submitted by security researchers (hunters). "
        "You must determine if the submitted bug report demonstrates a valid, genuine vulnerability against the provided project scope/code.\n"
        "</role>\n"
        "<rules>\n"
        "1. Read the Project Scope (which may contain code or a description of the architecture).\n"
        "2. Read the Bug Report data fetched from the hunter's submitted URL.\n"
        "3. Evaluate if the bug is technically valid and applicable to the Project Scope. Is it a real vulnerability (e.g., reentrancy, access control flaw, logic bug)?\n"
        "4. Output a strict JSON object and nothing else.\n"
        "Return JSON with exactly these keys:\n"
        '  "passed": boolean (true if it is a valid, genuine vulnerability report, false if it is spam, invalid, or irrelevant),\n'
        '  "summary": one short sentence (<= 200 chars) of plain-text technical reasoning.\n'
        "</rules>\n"
        f"<project_scope>\n{desc}\n</project_scope>\n"
        f"<bug_report_data>\n{telemetry}\n</bug_report_data>\n"
    )

    out = gl.nondet.exec_prompt(prompt, response_format="json")
    data = _clean_json(out)
    passed = bool(data.get("passed", False))
    summary = str(data.get("summary", ""))[:200]
    if not summary:
        summary = "no summary provided"
    return {"passed": passed, "summary": summary}

def _handle_leader_error(leaders_res, url, description) -> bool:
    try:
        _assess(url, description)
        return False
    except gl.vm.UserError as e:
        validator_msg = e.message if isinstance(e.message, str) else str(e.message)
    except Exception:
        return False

    if isinstance(leaders_res, gl.vm.UserError):
        leader_msg = leaders_res.message if isinstance(leaders_res.message, str) else str(leaders_res.message)
    else:
        leader_msg = getattr(leaders_res, "message", "")
        if not isinstance(leader_msg, str):
            leader_msg = str(leader_msg)

    if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(ERROR_EXTERNAL):
        return validator_msg == leader_msg
    if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(ERROR_TRANSIENT):
        return True
    return False

@allow_storage
@dataclass
class Bounty:
    bid: str
    creator: Address
    description: str
    bounty_atto: u256
    status: str            # OPEN | EVALUATING | COMPLETED | CLOSED
    hunter: Address
    submission_url: str
    last_summary: str

class BountySense(gl.Contract):
    bounties: TreeMap[str, Bounty]
    bounty_ids: DynArray[str]

    def __init__(self):
        pass

    @gl.public.write.payable
    def create_bounty(self, bid: str, description: str) -> dict:
        if bid in self.bounties:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} bounty id already exists")
        if len(bid) == 0 or len(bid) > 128:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} invalid bounty id length")
        if len(description) == 0:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} description cannot be empty")
        
        value = int(gl.message.value)
        if value <= 0:
             raise gl.vm.UserError(f"{ERROR_EXPECTED} bounty must have a positive value")

        bounty = Bounty(
            bid=bid,
            creator=gl.message.sender_address,
            description=description,
            bounty_atto=gl.message.value,
            status="OPEN",
            hunter=Address("0x0000000000000000000000000000000000000000"),
            submission_url="",
            last_summary="Bounty created"
        )
        self.bounties[bid] = bounty
        self.bounty_ids.append(bid)
        
        return {"bid": bid, "status": "OPEN", "bounty_atto": str(value)}

    @gl.public.write
    def submit_proof(self, bid: str, submission_url: str) -> dict:
        if bid not in self.bounties:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} unknown bounty")
        bounty = self.bounties[bid]
        if str(bounty.status) != "OPEN":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} bounty is not OPEN")
        if not (submission_url.startswith("http://") or submission_url.startswith("https://")):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} submission_url must be http(s)")

        bounty.hunter = gl.message.sender_address
        bounty.submission_url = submission_url
        bounty.status = "EVALUATING"
        bounty.last_summary = "Submission received, pending evaluation"
        
        return {"bid": bid, "status": "EVALUATING", "hunter": bounty.hunter.as_hex}

    @gl.public.write
    def evaluate_submission(self, bid: str) -> dict:
        if bid not in self.bounties:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} unknown bounty")
        bounty = self.bounties[bid]
        if str(bounty.status) != "EVALUATING":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} bounty is not in EVALUATING state")

        description = str(bounty.description)
        url = str(bounty.submission_url)

        def leader_fn() -> dict:
            return _assess(url, description)

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return _handle_leader_error(leaders_res, url, description)
            mine = _assess(url, description)
            l = bool(leaders_res.calldata["passed"])
            v = bool(mine["passed"])
            return l == v

        result = gl.vm.run_nondet(leader_fn, validator_fn)
        passed = bool(result["passed"])
        summary = str(result["summary"])[:200]

        if passed:
            bounty.status = "COMPLETED"
            bounty.last_summary = "Task accepted: " + summary
        else:
            bounty.status = "OPEN" # Reset to open so others (or same hunter) can try again
            bounty.hunter = Address("0x0000000000000000000000000000000000000000")
            bounty.submission_url = ""
            bounty.last_summary = "Task rejected: " + summary

        return {
            "bid": bid,
            "status": str(bounty.status),
            "passed": passed,
            "summary": summary
        }

    @gl.public.write
    def claim_bounty(self, bid: str) -> dict:
        if bid not in self.bounties:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} unknown bounty")
        bounty = self.bounties[bid]
        if str(bounty.status) != "COMPLETED":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} bounty is not COMPLETED")
        
        amount = int(bounty.bounty_atto)
        hunter = bounty.hunter

        # Reentrancy guard
        bounty.status = "CLOSED"
        
        if amount > 0:
            gl.get_contract_at(hunter).emit_transfer(value=u256(amount))
            bounty.last_summary += f" | BOUNTY AWARDED: {amount} attoGEN claimed by {hunter.as_hex}."

        return {
            "bid": bid,
            "status": "CLOSED",
            "paid_atto": str(amount),
            "hunter": hunter.as_hex
        }

    @gl.public.write
    def refund_bounty(self, bid: str) -> dict:
        """Allow the creator to cancel the bounty and get a refund if not completed."""
        if bid not in self.bounties:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} unknown bounty")
        bounty = self.bounties[bid]
        status = str(bounty.status)
        if status not in ("OPEN", "EVALUATING"):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} only OPEN/EVALUATING bounties can be refunded")
        if gl.message.sender_address != bounty.creator:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} only the creator can refund")

        amount = int(bounty.bounty_atto)
        creator = bounty.creator

        bounty.status = "CLOSED"
        bounty.last_summary = "Bounty cancelled and refunded"

        if amount > 0:
            gl.get_contract_at(creator).emit_transfer(value=u256(amount))
            bounty.last_summary += f" | REFUND CLAIMED: {amount} attoGEN returned to {creator.as_hex}."

        return {
            "bid": bid,
            "status": "CLOSED",
            "refunded_atto": str(amount),
            "creator": creator.as_hex
        }

    @gl.public.view
    def get_bounty(self, bid: str) -> dict:
        if bid not in self.bounties:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} unknown bounty")
        bounty = self.bounties[bid]
        return {
            "bid": str(bounty.bid),
            "creator": bounty.creator.as_hex,
            "description": str(bounty.description),
            "bounty_atto": str(int(bounty.bounty_atto)),
            "status": str(bounty.status),
            "hunter": bounty.hunter.as_hex,
            "submission_url": str(bounty.submission_url),
            "last_summary": str(bounty.last_summary),
        }

    @gl.public.view
    def list_bounties(self) -> dict:
        rows = []
        for bid in self.bounty_ids:
            b = self.bounties[bid]
            rows.append({
                "bid": str(b.bid),
                "status": str(b.status),
                "bounty_atto": str(int(b.bounty_atto)),
                "creator": b.creator.as_hex,
            })
        return {"count": len(rows), "bounties": rows}
