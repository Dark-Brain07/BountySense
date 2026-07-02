# BountySense

### Decentralized Qualitative Bounties on GenLayer

BountySense is a decentralized bounty platform that uses GenLayer's AI consensus to automatically evaluate and pay out subjective, natural-language tasks. Unlike traditional smart contracts that require a centralized judge or deterministic oracles, BountySense allows creators to lock GEN tokens behind a natural-language description (e.g., "Write a comprehensive tutorial on using GenLayer with React"). Hunters submit a URL as proof of their work, and GenLayer validators use an LLM to evaluate if the submission meets the criteria. If consensus is reached, the bounty is paid out automatically.

## How it works

1. **Create a Bounty**: A creator locks GEN tokens and defines a subjective task in natural language.
2. **Submit Proof**: A hunter completes the task and submits a public URL (e.g., a GitHub repository, a blog post, or a live demo).
3. **AI Consensus Evaluation**: GenLayer validators fetch the submitted URL and use an LLM to evaluate if the work strictly meets the task description.
4. **Settlement**: If the consensus determines the task was successfully completed, the locked GEN is transferred to the hunter. If rejected, the bounty remains open for other attempts.

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

### Smart Contract

To deploy the intelligent contract to the GenLayer Bradbury Testnet:

1. Create a `.env` file in the root directory and add your private key:
   ```
   ACCOUNT_PRIVATE_KEY=0xYourPrivateKeyHere
   ```
2. Run the deployment script:
   ```bash
   bash deploy/deploy.sh
   ```

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

## Design

BountySense features a premium dark-mode aesthetic with glassmorphism, dynamic gradients, and smooth micro-animations to provide an immersive experience.

## Deployment to Vercel

The frontend is ready to be deployed to Vercel or any other modern hosting provider. Simply connect your GitHub repository and set the build command to `npm run build` and the output directory to `dist`.
