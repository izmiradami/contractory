import type { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'cancun',
    },
  },
  networks: {
    // Local development
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    // Arc Testnet
    arcTestnet: {
      url: process.env.NEXT_PUBLIC_ARC_RPC_URL ?? 'https://rpc.testnet.arc.network',
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 72,
      gasPrice: 'auto',
    },
  },
  paths: {
    sources:   './contracts',
    tests:     './tests/hardhat',
    cache:     './cache',
    artifacts: './artifacts',
  },
}

export default config
