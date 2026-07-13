export const CONTRACT_ADDRESS = "0xB801c3721759c9Bb9Aae12103d106A1A46709F05";
export const PRIVY_APP_ID = "cmr2v6yi900640cjunvb4r3ui";

export const NETWORK = {
  name: "Bradbury",
  chainId: 4221,
  rpc: "https://rpc-bradbury.genlayer.com",
  explorer: "https://explorer-bradbury.genlayer.com",
  faucet: "https://testnet-faucet.genlayer.foundation/",
};

export const txUrl = (hash: string) => `${NETWORK.explorer}/tx/${hash}`;
