export const CONTRACT_ADDRESS = "0xe47ee84495c41F296e176786c054057fF0950262";
export const PRIVY_APP_ID = "cmr2v6yi900640cjunvb4r3ui";

export const NETWORK = {
  name: "Bradbury",
  chainId: 4221,
  rpc: "https://rpc-bradbury.genlayer.com",
  explorer: "https://explorer-bradbury.genlayer.com",
  faucet: "https://testnet-faucet.genlayer.foundation/",
};

export const txUrl = (hash: string) => `${NETWORK.explorer}/tx/${hash}`;
