import Address from '@/store/wallet/entities/address';
import Wallet from '@/store/wallet/entities/wallet';
import Tx from '@/store/wallet/entities/tx';
import Utxo from '@/store/wallet/entities/utxo';
import CryptoWalletJs from 'cryptowallet-js';
import networks from '@/store/settings/state/supportedNetworks';

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

async function updateBalance(coinSDK, wallet, addresses) {
  const balance = wallet.confirmedBalance;
  let newBalance = 0;

  if (wallet.sdk === 'Bitcoin') {
    const storedUtxos = Utxo.query()
      .where('wallet_id', wallet.id)
      .get()
      .map((utxo) => { return utxo.txid; });
    const utxos = await coinSDK.getUTXOs(addresses, wallet.network);
    const newUtxos = utxos.filter((utxo) => {
      newBalance += utxo.amount;
      utxo.account_id = wallet.account_id;
      utxo.wallet_id = wallet.id;
      return !storedUtxos.includes(utxo.txid);
    });

    if (newUtxos.length > 0) {
      Utxo.$insert({ data: newUtxos });
    }

    const oldUtxos = storedUtxos.filter((utxo) => {
      return !utxos.map((ut) => { return ut.txid; }).includes(utxo);
    });
    oldUtxos.forEach((id) => {
      const utxo = Utxo.query()
        .where('txid', id)
        .get();
      Utxo.$delete(utxo[0].id);
    });
  }
  // eslint-disable-next-line no-console
  // console.log(`Update Balances ${wallet.sdk}`);
  if (wallet.sdk === 'Ethereum' || wallet.sdk === 'Celo') {
    newBalance = await coinSDK.getBalance(
      [wallet.externalAddress],
      wallet.network,
    );
  }

  if (wallet.sdk === 'ERC20') {
    newBalance = await coinSDK.getBalance(wallet.erc20Wallet);
  }

  if (newBalance !== balance) {
    Wallet.$update({
      where: wallet.id,
      data: { confirmedBalance: parseFloat(newBalance) },
    });
    return true;
  }
  return false;
}

function updateTxs(txs, wallet) {
  txs.forEach((tx) => {
    const txId = Tx.query()
      .where('hash', tx.hash)
      .where('wallet_id', wallet.id)
      .get()[0].id;

    Tx.$update({
      where: txId,
      data: tx,
    });
  });
}

function insertTxs(txs, wallet, coinSDK) {
  const transactions = txs.map((tx) => {
    tx.account_id = wallet.account_id;
    tx.wallet_id = wallet.id;
    return tx;
  });

  Tx.$insert({
    data: transactions,
  });

  // update external address
  if (wallet.sdk === 'Bitcoin') {
    const newExternalAddress = txs.some((tx) => {
      return tx.receiver.includes(wallet.externalAddress);
    });

    if (newExternalAddress) {
      // generate new address
      const addr = coinSDK.generateAddress(wallet.hdWallet, wallet.externalChainAddressIndex + 1);

      const newAddress = {
        account_id: wallet.account_id,
        wallet_id: wallet.id,
        chain: 'external',
        address: addr.address,
        index: addr.index,
      };

      Address.$insert({ data: newAddress });

      Wallet.$update({
        where: wallet.id,
        data: {
          externalChainAddressIndex: addr.index,
          externalAddress: addr.address,
        },
      });
    }
  }
}

function storeTxs(txs, wallet, coinSDK) {
  if (wallet.sdk !== 'Bitcoin') {
    const newAmount = 100;
    if (txs.length > newAmount) {
      txs = txs.slice(0, newAmount);
    }
  }

  const storedTxs = Tx.query().where('wallet_id', wallet.id).get().map((tx) => {
    return tx.hash;
  });

  if (storedTxs.length > 0) {
    const foundTxs = txs.filter((tx) => { return storedTxs.includes(tx.hash); });
    const newTxs = txs.filter((tx) => { return !storedTxs.includes(tx.hash); });

    updateTxs(foundTxs, wallet);
    if (newTxs.length > 0) {
      insertTxs(newTxs, wallet, coinSDK);
    }
  } else {
    insertTxs(txs, wallet, coinSDK);
  }
}

async function refreshBitcoin(coinSDK, wallet, fullRefresh) {
  const addresses = Address.query()
    .where('wallet_id', wallet.id)
    .get()
    .map((item) => { return item.address; });

  const addressesRaw = addresses.filter(onlyUnique);

  const balanceChanged = await updateBalance(coinSDK, wallet, addressesRaw);

  if (balanceChanged || fullRefresh) {
    const txAmount = Tx.query().where('wallet_id', wallet.id).get().length;
    const apiReturnLimit = 50;
    const newAmount = 5;
    const moreTxsThanLimit = apiReturnLimit <= txAmount;
    const from = moreTxsThanLimit ? (Math.max(0, (txAmount - apiReturnLimit)) + newAmount) : 0;
    const to = moreTxsThanLimit ? (from + apiReturnLimit) : apiReturnLimit;
    const txHistory = await coinSDK.getTransactionHistory(
      addressesRaw,
      wallet.network,
      from,
      to,
    );

    if (!txHistory) {
      return false;
    }

    storeTxs(txHistory.txs, wallet, coinSDK);
  }
  return balanceChanged;
}

async function refreshEthereum(coinSDK, wallet, fullRefresh) {
  const balanceChanged = await updateBalance(coinSDK, wallet);
  if (balanceChanged || fullRefresh) {
    const { network } = wallet;

    const txHistory = await coinSDK.getTransactionHistory(
      [wallet.externalAddress],
      network,
      0,
    );

    if (!txHistory || txHistory.txs.length === 0) {
      return false;
    }

    storeTxs(txHistory.txs, wallet, coinSDK);
  }

  return balanceChanged;
}

async function refreshERC20(coinSDK, wallet, fullRefresh) {
  const balanceChanged = await updateBalance(coinSDK, wallet);
  if (balanceChanged || fullRefresh) {
    const txHistory = await coinSDK.getTransactionHistory(wallet.erc20Wallet, 0);
    if (!txHistory || txHistory.length === 0) {
      return false;
    }

    storeTxs(txHistory, wallet, coinSDK);
  }
  return balanceChanged;
}

async function refreshWallet(wallet, fullRefresh = true) {
  const api = networks[wallet.network];
  const crypto = new CryptoWalletJs();
  const coinSDK = crypto.SDKFactory.createSDK(wallet.sdk, api);

  if (wallet.sdk === 'Bitcoin') {
    return refreshBitcoin(coinSDK, wallet, fullRefresh);
  }

  if (wallet.sdk === 'Ethereum') {
    return refreshEthereum(coinSDK, wallet, fullRefresh);
  }
  // console.log(`Refresh WALLET ${JSON.stringify(wallet)}`);
  if (wallet.sdk === 'Celo') {
    return refreshEthereum(coinSDK, wallet, fullRefresh);
  }

  if (wallet.sdk === 'ERC20') {
    return refreshERC20(coinSDK, wallet, fullRefresh);
  }

  return false;
}

export default refreshWallet;
