async function discoverBitcoin(wallet, coinSDK, network) {
  const externalAccountDiscovery = await coinSDK.accountDiscovery(wallet);
  const internalAccountDiscovery = await coinSDK.accountDiscovery(wallet, true);

  let combinedUsedAddresses = [
    ...externalAccountDiscovery.active.map((item) => {
      return item.address;
    }),
    ...internalAccountDiscovery.used.map((item) => {
      return item.address;
    }),
  ];

  let combinedActiveAddresses = [
    ...externalAccountDiscovery.active.map((item) => {
      return item.address;
    }),

    ...internalAccountDiscovery.active.map((item) => {
      return item.address;
    }),
  ];

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  combinedUsedAddresses = combinedUsedAddresses.filter(onlyUnique);
  combinedActiveAddresses = combinedActiveAddresses.filter(onlyUnique);

  let utxos = [];
  if (combinedActiveAddresses.length > 0) {
    utxos = await coinSDK.getUTXOs(combinedActiveAddresses, network);
  }

  let balance = 0;
  utxos.forEach((utxo) => {
    balance += utxo.amount;
  });

  let txHistory = {
    address: [],
    txs: [],
  };
  const apiReturnLimit = 50;
  const collectHistory = async (from, to) => {
    const history = await coinSDK.getTransactionHistory(combinedUsedAddresses, network, from, to);
    txHistory = {
      ...history,
      address: txHistory.address.concat(history.address),
      txs: txHistory.txs.concat(history.txs),
    };
    if (txHistory.more) {
      await collectHistory(to + 1, to + (apiReturnLimit - 1));
    }
  };

  if (combinedUsedAddresses.length > 0) { await collectHistory(0, apiReturnLimit); }

  const externalChainAddressIndex = externalAccountDiscovery.nextAddress;
  const internalChainAddressIndex = internalAccountDiscovery.nextAddress;

  return {
    txHistory,
    externalAccountDiscovery,
    internalAccountDiscovery,
    externalChainAddressIndex,
    internalChainAddressIndex,
    balance,
    utxos,
  };
}

async function discoverEthereum(wallet, coinSDK, network) {
  const accounts = await coinSDK.accountDiscovery(wallet);
  const txHistory = await coinSDK.getTransactionHistory([accounts[0].address], network, 0);
  let balance = await coinSDK.getBalance([accounts[0].address], network);

  if (!balance) {
    balance = 0;
  }
  return {
    accounts,
    txHistory,
    balance,
  };
}

async function discoverErc20(wallet, coinSDK) {
  const accounts = [{
    address: wallet.address,
    index: 0,
  }];
  const txHistory = await coinSDK.getTransactionHistory(wallet, 0);
  let balance = await coinSDK.getBalance(wallet);
  if (!balance) {
    balance = 0;
  }
  return {
    txHistory,
    accounts,
    balance,
  };
}

async function discoverCelo(wallet, coinSDK, network, seedString) {
  const accounts = await coinSDK.accountDiscovery(wallet, false, seedString);
  const txHistory = await coinSDK.getTransactionHistory([accounts[0].address], network, 0);
  let balance = await coinSDK.getBalance([accounts[0].address], network);

  if (!balance) {
    balance = 0;
  }
  return {
    accounts,
    txHistory,
    balance,
  };
}

async function discoverWallet(wallet, coinSDK, network, sdk, erc20History = false, seedString = '') {
  if (sdk === 'Bitcoin') {
    return discoverBitcoin(wallet, coinSDK, network);
  }

  if (sdk === 'Ethereum') {
    return discoverEthereum(wallet, coinSDK, network, erc20History);
  }

  if (sdk === 'ERC20') {
    return discoverErc20(wallet, coinSDK);
  }

  if (sdk === 'Celo') {
    // eslint-disable-next-line no-console
    // console.log(`CELO seedString ${seedString}`);
    return discoverCelo(wallet, coinSDK, network, seedString);
  }
  return false;
}

export default ({ Vue }) => {
  Vue.prototype.discoverWallet = discoverWallet;
};
