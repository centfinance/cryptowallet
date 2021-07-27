import { uid } from 'quasar';
import Account from '@/store/wallet/entities/account';
import Wallet from '@/store/wallet/entities/wallet';
import CryptoWalletSDK from 'cryptowallet-js';
import bcrypt from 'bcryptjs';
// import AES from 'crypto-js/aes';

const demoSeed = 'give grow opera kid slide wrist final tattoo trust system valve impulse';

// function encrypt(data, password) {
//   try {
//     return AES.encrypt(JSON.stringify(data), password).toString();
//   } catch (exception) {
//     throw new Error(exception.message);
//   }
// }

const accountInitializer = {

  async createAccount(setup) {
    const accounts = Account.all();
    const password = setup.pinArray.join('');
    const pinHash = bcrypt.hashSync(password, setup.salt);
    const accData = {
      uid: uid(),
      name: setup.accountName,
      email: setup.accountEmail || null,
      currency: setup.accountCurrency || accounts[0].currency,
      salt: setup.salt,
      pinHash,
      default: accounts.length === 0,
      locale: setup.accountLocale || accounts[0].locale,
      node: setup.accountIpNode,
      demoMode: setup.demoMode,
    };

    try {
      // eslint-disable-next-line object-shorthand
      const result = await Account.$insert({ data: accData, password });
      return result[0];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`INSERTION ERR ${error}`);
      throw error;
    }
  },

  async createWallets(setup, id, coins) {
    const seedString = setup.demoMode ? demoSeed : setup.seedString;
    const password = setup.pinArray.join('');
    const SDK = new CryptoWalletSDK();
    const promises = [];
    coins.forEach((coin) => {
      const wallet = {
        account_id: id,
        name: coin.name,
        displayName: coin.displayName,
        symbol: coin.symbol,
        sdk: coin.sdk,
        network: coin.network,
      };
      if (coin.sdk !== 'ERC20') {
        promises.push(new Promise(async (resolve) => {
          const coinSDK = SDK.SDKFactory.createSDK(coin.sdk, coin.api);
          if (coin.sdk === 'Celo') {
            wallet.hdWallet = await coinSDK.generateHDWalletCelo(
              seedString,
              coin.network,
            );
          } else {
            wallet.hdWallet = await coinSDK.generateHDWallet(
              seedString,
              coin.network,
            );
          }
          wallet.chainId = wallet.hdWallet.network.chainId;
          // wallet.hdWallet = encrypt(hdWallet, password);
          await Wallet.$insert({ data: wallet, password });
          resolve();
        }));
      }
    });
    await Promise.all(promises);
  },

  async createERC20Wallets(setup, id, coins, ethWallet) {
    const SDK = new CryptoWalletSDK();
    const promises = [];

    const addERC20 = ((coin) => {
      const wallet = {
        account_id: id,
        name: coin.name,
        displayName: coin.displayName,
        symbol: coin.symbol,
        sdk: coin.sdk,
        network: coin.network,
      };
      promises.push(new Promise(async (resolve) => {
        const coinSDK = SDK.SDKFactory.createSDK(coin.sdk, coin.api);
        // const parentSDK = await SDK.SDKFactory.createSDK(coin.parentSdk, coin.api);
        // const parentWallet = await parentSDK.generateHDWallet(
        //   setup.seedString,
        //   coin.network,
        // );
        // const keyPair = parentSDK.generateKeyPair(parentWallet, 0);

        wallet.erc20Wallet = await coinSDK.generateERC20Wallet(
          {
            address: ethWallet.address,
            network: coin.network,
            type: 'Ethereum',
          },
          coin.name,
          coin.symbol,
          coin.contractAddress,
          coin.decimals,
        );

        wallet.parentSdk = coin.parentSdk;
        wallet.parentName = coin.parentName;
        wallet.contractAddress = coin.contractAddress;
        wallet.decimals = coin.decimals;

        await Wallet.$insert({ data: wallet });
        resolve();
      }));
    });


    coins.forEach((coin) => {
      if (coin.sdk === 'ERC20') {
        addERC20(coin);
      }
    });
    await Promise.all(promises);
  },
};

export default ({ Vue }) => {
  Vue.prototype.accountInitializer = accountInitializer;
};
