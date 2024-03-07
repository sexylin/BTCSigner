import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@oasisprotocol/sapphire-hardhat'

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    'sapphire-testnet': {
     // This is Testnet! If you want Mainnet, add a new network config item.
        url: "https://testnet.sapphire.oasis.dev",
          accounts: ['0x35856149757c8c81cd6cb6fa51b57a5b7c597d4f87486fc49be4a0b16282d565'],
          chainId: 0x5aff,
    },
  },
};

export default config;
