#!/bin/bash
# deploy.sh
# Deploys the BountySense intelligent contract to GenLayer Bradbury testnet.

set -e

if [ -z "$ACCOUNT_PRIVATE_KEY" ]; then
  if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
  fi
fi

if [ -z "$ACCOUNT_PRIVATE_KEY" ]; then
  echo "Error: ACCOUNT_PRIVATE_KEY is not set."
  exit 1
fi

echo "Deploying BountySense intelligent contract..."
genvm-deploy \
  --private-key "$ACCOUNT_PRIVATE_KEY" \
  --contract contracts/bountysense.py \
  --args "[]"

echo "Deployment complete."
