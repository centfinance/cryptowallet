import Utxo from '@/store/wallet/entities/utxo';
import Tx from '@/store/wallet/entities/tx';

const Bitcoin = {
  getConfirmed(walletId, accountId) {
    let balance = 0;

    const utxos = Utxo.query()
      .where('account_id', accountId)
      .where('wallet_id', walletId)
      .get();

    utxos.forEach((utxo) => {
      balance += utxo.amount;
    });

    return balance;
  },

  getUnconfirmed(walletId, accountId) {
    let balance = 0;

    const utxos = Utxo.query()
      .where('account_id', accountId)
      .where('wallet_id', walletId)
      .get();

    utxos.forEach((utxo) => {
      balance += utxo.amount;
      balance -= utxo.spentValue;
    });

    return balance;
  },

  getAvailable(walletId, accountId) {
    let balance = 0;

    const utxos = Utxo.query()
      .where('account_id', accountId)
      .where('wallet_id', walletId)
      .get();

    utxos.forEach((utxo) => {
      if (!utxo.pending) {
        balance += utxo.amount;
      }
    });

    return balance;
  },
};

const Ethereum = {
  getConfirmed(wallet) {
    return wallet.confirmedBalance;
  },

  getUnconfirmed(wallet, accountId) {
    let balance = wallet.confirmedBalance;

    const txs = Tx.query()
      .where('account_id', accountId)
      .where('wallet_id', wallet.id)
      .get();

    txs.forEach((tx) => {
      if (tx.confirmations === 0 && tx.sent) {
        if (wallet.sdk !== 'ERC20') {
          balance -= (parseFloat(tx.fee) + parseFloat(tx.value));
        } else {
          balance -= parseFloat(tx.value);
        }
      }
    });
    return balance;
  },

  getAvailable(wallet, accountId) {
    let balance = wallet.confirmedBalance;

    const txs = Tx.query()
      .where('account_id', accountId)
      .where('wallet_id', wallet.id)
      .get();

    txs.forEach((tx) => {
      if (tx.confirmations === 0 && tx.sent) {
        if (wallet.sdk !== 'ERC20') {
          balance -= (parseFloat(tx.fee) + parseFloat(tx.value));
        } else {
          balance -= parseFloat(tx.value);
        }
      }
    });

    return balance;
  },
};


function getBalance(wallet, accountId) {
  if (wallet.sdk === 'Ethereum' || wallet.sdk === 'ERC20' || wallet.sdk === 'Celo') {
    return {
      confirmed: Ethereum.getConfirmed(wallet),
      unconfirmed: Ethereum.getUnconfirmed(wallet, accountId),
      available: Ethereum.getAvailable(wallet, accountId),
    };
  }

  return {
    confirmed: Bitcoin.getConfirmed(wallet.id, accountId),
    unconfirmed: Bitcoin.getUnconfirmed(wallet.id, accountId),
    available: Bitcoin.getAvailable(wallet.id, accountId),
  };
}

export default getBalance;
