import Coin from '@/store/wallet/entities/coin';
import Wallet from '@/store/wallet/entities/wallet';
import Tx from '@/store/wallet/entities/tx';

export async function storeERC20Coin(coin) {
  const findCoin = Coin.query()
    .where('contractAddress', coin.contractAddress).get();

  // if (findCoin.length > 0) {
  //   console.log('found');
  //   await Coin.$update({
  //     where: (record) => {
  //       return (record.contractAddress === coin.contractAddress)
  //       && (record.name === coin.name);
  //     },
  //     data: coin,
  //   });
  //   return findCoin[0].name;
  // }
  if (findCoin.length === 0) {
    const newCoin = await Coin.$insert({
      data: coin,
    });
    return newCoin.coin[0].name;
  }
  return false;
}

export async function storeERC20Wallet(wallet, ERC20SDK) {
  const getBalance = async () => {
    return ERC20SDK.getBalance({
      contract: wallet.contractAddress,
      address: wallet.externalAddress,
      decimals: wallet.decimals,
    });
  };
  const balance = await getBalance();
  const findWallet = Wallet.query()
    .where('contractAddress', wallet.contractAddress)
    .where('account_id', wallet.account_id).get();
  if (findWallet.length > 0) {
    const found = findWallet[0];
    if (balance !== found.confirmedBalance) {
      await Wallet.$update({
        where: found.id,
        data: {
          confirmedBalance: balance,
          imported: true,
          enabled: true,
        },
      });
    }
    return {
      id: findWallet[0].id,
      storeTxs: balance !== found.confirmedBalance,
    };
  }


  wallet.confirmedBalance = balance;
  wallet.enabled = balance > 0;
  wallet.imported = balance > 0;

  const newWallet = await Wallet.$insert({
    data: wallet,
  });

  return {
    id: newWallet.wallet[0].id,
    storeTxs: true,
  };
}

export async function storeTx(tx) {
  const findTx = Tx.query()
    .where('hash', tx.hash)
    .where('account_id', tx.account_id).get();

  if (findTx.length > 0) {
    await Tx.$update({
      where: findTx[0].id,
      data: tx,
    });
    return findTx[0].id;
  }

  const newTx = await Tx.$insert({
    data: tx,
  });

  return newTx.tx[0].id;
}
