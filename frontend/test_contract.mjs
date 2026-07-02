import { createClient, createAccount } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config({ path: '../.env' });

const PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("Please ensure ACCOUNT_PRIVATE_KEY is set in your .env file.");
  process.exit(1);
}

// Ensure the private key has the 0x prefix
const formattedKey = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;

// The contract address you just deployed
const CONTRACT_ADDRESS = "0xa0f17c9d25eEC4FA04eA8372B2aa6eA9f535F6b1";

async function main() {
  console.log("Connecting to GenLayer Bradbury testnet...");
  
  const client = createClient({
    chain: testnetBradbury,
    account: createAccount(formattedKey),
  });

  console.log("Creating a test bounty on the contract...");
  
  // Method: create_bounty(bid: str, description: str)
  // Value: We will lock 0.01 GEN (which is 10,000,000,000,000,000 atto)
  const bountyId = "test-bounty-" + Math.floor(Math.random() * 10000);
  const description = "Test bounty: verify the smart contract and frontend integration are working.";
  const valueAtto = 10000000000000000n; 
  
  try {
    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: "create_bounty",
      args: [bountyId, description],
      value: valueAtto,
    });
    
    console.log(`\nSuccess! Transaction hash: ${hash}`);
    console.log(`Bounty ID created: ${bountyId}`);
    console.log(`\nNow go to your React app at http://localhost:5173 to see it live!`);
    console.log(`(It might take a few seconds for the block to confirm)`);
    
  } catch (error) {
    console.error("Error creating bounty:", error);
  }
}

main();
