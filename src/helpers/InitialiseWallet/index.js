import Wallet from '@/store/wallet/entities/wallet';

async function initialiseWallet(accountId) {
  return new Promise(async (resolve) => {
    const initializedWallets = {};
    // let activeWallets[accountId] = initializedWallets;

    const wallets = Wallet.query()
      .where('account_id', accountId)
      .where('enabled', true)
      .get();
    if (wallets.length === 0) {
      resolve();
    }

    async function generate(wallet) {
      initializedWallets[wallet.name] = wallet.hdWallet;
    }
    async function generateErc20(wallet) {
      initializedWallets[wallet.name] = wallet.erc20Wallet;
    }

    const erc20Promises = [];
    const promises = [];
    wallets.forEach((wallet) => {
      if (wallet.sdk !== 'ERC20') {
        promises.push(new Promise(async (res) => {
          await generate(wallet);
          res();
        }));
      }
    });
    await Promise.all(promises);

    wallets.forEach((wallet) => {
      if (wallet.sdk === 'ERC20') {
        erc20Promises.push(new Promise(async (res) => {
          await generateErc20(wallet);
          res();
        }));
      }
    });

    await Promise.all(erc20Promises);

    resolve();
  });
}

export default initialiseWallet;
