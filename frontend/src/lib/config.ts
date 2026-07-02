export const CONTRACT_ADDRESS = "0xa0f17c9d25eEC4FA04eA8372B2aa6eA9f535F6b1";
export const PRIVY_APP_ID = "cmr2v6yi900640cjunvb4r3ui";

export const NETWORK = {
  name: "Bradbury",
  chainId: 4221,
  rpc: "https://rpc-bradbury.genlayer.com",
  explorer: "https://explorer-bradbury.genlayer.com",
  faucet: "https://testnet-faucet.genlayer.foundation/",
};

export const txUrl = (hash: string) => `${NETWORK.explorer}/tx/${hash}`;
