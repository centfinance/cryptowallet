const etherscanToken = process.env.ETHERSCAN_TOKEN;

export default {
  ETHEREUM: {
    name: 'ETHEREUM',
    coinName: 'Ethereum',
    segwit: false,
    bip: 60,
    provider: 'https://mainnet.infura.io/v3/e68cb3352f7d4fb7848c4650917e4422',
    etherscan: 'https://api.etherscan.io/api',
    etherscanKey: etherscanToken,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 1,
    ens: true,
  },
  ETHEREUM_CLASSIC: {
    name: 'ETHEREUM_CLASSIC',
    coinName: 'Ethereum Classic',
    segwit: false,
    bip: 60,
    provider: 'https://www.ethercluster.com/etc',
    etherscan: 'https://blockscout.com/etc/mainnet/api',
    etherscanKey: null,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 61,
  },
  XDAI: {
    name: 'XDAI',
    coinName: 'XDai',
    segwit: false,
    bip: 60,
    provider: 'https://dai.poa.network',
    etherscan: 'https://blockscout.com/poa/xdai/api',
    etherscanKey: null,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 100,
  },
  POA: {
    name: 'POA',
    coinName: 'POA',
    segwit: false,
    bip: 178,
    provider: 'https://core.poa.network',
    etherscan: 'https://blockscout.com/poa/core/api',
    etherscanKey: null,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 99,
  },
  ETHEREUM_ROPSTEN: {
    name: 'ETHEREUM_ROPSTEN',
    coinName: 'Ethereum Ropsten',
    segwit: false,
    bip: 60,
    provider: 'https://ropsten.infura.io/v3/e68cb3352f7d4fb7848c4650917e4422',
    etherscan: 'https://api-ropsten.etherscan.io/api',
    etherscanKey: etherscanToken,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 3,
    ens: true,
  },
  ETHEREUM_KOVAN: {
    name: 'ETHEREUM_KOVAN',
    coinName: 'Ethereum Kovan',
    segwit: false,
    bip: 60,
    provider: 'https://kovan.infura.io/v3/e68cb3352f7d4fb7848c4650917e4422',
    etherscan: 'https://api-kovan.etherscan.io/api',
    etherscanKey: etherscanToken,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 42,
    ens: true,
  },
  ETHEREUM_RINKEBY: {
    name: 'ETHEREUM_RINKEBY',
    coinName: 'Ethereum Rinkeby',
    segwit: false,
    bip: 42,
    provider: 'https://rinkeby.infura.io/v3/e68cb3352f7d4fb7848c4650917e4422',
    etherscan: 'https://api-rinkeby.etherscan.io/api',
    etherscanKey: etherscanToken,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 4,
    ens: true,
  },
  ETHEREUM_GOERLI: {
    name: 'ETHEREUM_GOERLI',
    coinName: 'Ethereum Goerli',
    segwit: false,
    bip: 42,
    provider: 'https://goerli.infura.io/v3/e68cb3352f7d4fb7848c4650917e4422',
    etherscan: 'https://api-goerli.etherscan.io/api',
    etherscanKey: etherscanToken,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 5,
    ens: true,
  },
  POA_SOKOL: {
    name: 'POA_SOKOL',
    coinName: 'POA Sokol',
    segwit: false,
    bip: 178,
    provider: 'https://sokol.poa.network',
    etherscan: 'https://blockscout.com/poa/sokol/api',
    etherscanKey: null,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 77,
  },
  CELO: {
    name: 'CELO',
    coinName: 'Celo',
    segwit: false,
    bip: 42220,
    provider: 'https://forno.celo.org',
    etherscan: 'https://explorer.celo.org/api',
    etherscanKey: null,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 42220,
  },
  CELO_ALFAJORES: {
    name: 'CELO_ALFAJORES',
    coinName: 'Celo',
    segwit: false,
    bip: 44787,
    provider: 'https://alfajores-forno.celo-testnet.org',
    etherscan: 'https://alfajores-blockscout.celo-testnet.org/api',
    etherscanKey: null,
    feeApi: 'https://api.blockcypher.com/v1/eth/main',
    chainId: 44787,
  },
};
