# BountySense: AI-Powered Web3 Security Auditor

### Decentralized Zero-Day Bug Bounties on GenLayer

BountySense is a revolutionary decentralized security protocol that uses GenLayer's AI consensus to evaluate zero-day exploits and smart contract vulnerabilities. 

Unlike traditional bug bounty platforms that require trusting a centralized team to manually triage reports and pay out rewards, BountySense is fully automated and trustless. Developers lock GEN tokens behind a "Project Scope" (their smart contract code or GitHub repo). Security researchers (hunters) submit a URL containing their vulnerability report or exploit proof. 

GenLayer validators use an LLM (operating as an elite security auditor) to cross-reference the project code against the submitted bug report. If the consensus determines the exploit is technically valid and severe, the bounty is automatically unlocked and recorded for the whitehat hacker.

## How it works

1. **Lock Bounty**: A protocol developer locks GEN tokens and defines their "Project Scope" (pasting the code or a link to the repo).
2. **Submit Exploit Proof**: A security researcher finds a vulnerability and submits a public URL (e.g., a Pastebin, Gist, or report) containing the exploit details.
3. **AI Consensus Auditor**: GenLayer validators fetch the bug report and use an LLM to evaluate if the vulnerability is genuine, valid, and applicable to the scope.
4. **Settlement**: If the AI consensus verifies the bug, the hunter is credited with the locked GEN reward. This completely removes the need for trusted third-party auditors!

## Project Structure

```
BountySense/
├── contracts/
│   └── bountysense.py       # GenLayer Intelligent Contract
├── deploy/
│   └── deploy.sh            # Deployment script for Bradbury Testnet
├── frontend/                # React + Vite frontend application
└── README.md
```

## Running Locally

### Frontend

The frontend is built with React, Vite, and Vanilla CSS for a modern, glassmorphic UI.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
