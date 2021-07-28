import { Model } from '@vuex-orm/core';
import CryptoWalletJs from 'cryptowallet-js';
import axios from 'axios';
import IconList from '@/statics/cc-icons/icons-list.json';
// import Wallet from './wallet';
// import Tx from './tx';
import { storeERC20Wallet, storeERC20Coin, storeTx } from '@/helpers/StorageHelpers';
import networks from '../../settings/state/supportedNetworks';

/**
 * Coin Entity.
 */
export default class Coin extends Model {
  static entity = 'coin';

  static fields() {
    return {
      id: this.increment(),
      name: this.attr(''),
      displayName: this.attr(''),
      minConfirmations: this.attr(''),
      sdk: this.attr(''),
      symbol: this.attr(''),
      network: this.attr(''),
      denomination: this.attr(''),
      parentName: this.attr(''),
      parentSdk: this.attr(''),
      contractAddress: this.attr(''),
      decimals: this.attr(''),
      identifier: this.attr(''),
      api: this.attr(''),
      icon: this.attr(null),
      imported: this.attr(false),
      testnet: this.attr(false),
      transak: this.attr(false),
      rampNetwork: this.attr(false),
      show: this.attr(true),
    };
  }

  get logo() {
    // if (this.icon) {
    //   console.log(this.logo);
    //   return `data:image/png;base64, ${this.logo}`;
    // }
    const coinIcon = IconList.find((icon) => {
      return icon.symbol === this.symbol.toUpperCase();
    });
    if (coinIcon) {
      const fileType = coinIcon.png ? '.png' : '.svg';
      return `./statics/cc-icons/color/${this.symbol.toLowerCase()}${fileType}`;
    }
    return './statics/cc-icons/color/generic.svg';
  }

  static async fetchIcons() {
    function fetchIcon(token, address) {
      let url = '';
      if (token.symbol === 'Celo') {
        url = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/info/logo.png';
      } else {
        url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
      }
      axios
        .get(url, {
          responseType: 'arraybuffer',
        })
        .then((response) => {
          const base64 = Buffer.from(response.data, 'binary').toString('base64');
          Coin.$update({
            where: token.id,
            data: {
              icon: base64,
            },
          });
        });
    }

    const tokens = Coin.query()
      // .where('sdk', 'ERC20')
      .where((coin) => { return coin.sdk === 'ERC20' || coin.sdk === 'Celo'; })
      .where('parentName', 'Ethereum')
      .where('icon', null)
      .get();

    if (tokens.length > 0) {
      const whitelist = (await axios.get('https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/allowlist.json'))
        .data;

      const promises = tokens
        .map((t) => {
          const index = whitelist.findIndex((item) => {
            return t.contractAddress.toLowerCase() === item.toLowerCase();
          });
          if (t.symbol === 'Celo') {
            return fetchIcon(t, whitelist[index]);
          }
          return index === -1 ? null : fetchIcon(t, whitelist[index]);
        });

      await Promise.all(promises);
    }
  }

  static findToken(name, contract = false) {
    let coin;
    if (contract) {
      coin = Coin.query()
        .where('name', name)
        .where('contractAddress', contract)
        .get();
    } else {
      coin = Coin.query()
        .where('name', name)
        .get();
    }

    return coin.length > 0 ? coin[0] : null;
  }

  static deleteToken(name, contract = false) {
    let coin;
    if (contract) {
      coin = Coin.query()
        .where('name', name)
        .where('contractAddress', contract)
        .get();
    } else {
      coin = Coin.query()
        .where('name', name)
        .get();
    }

    return coin.length > 0 ? coin[0] : null;
  }

  static async fetchAllTokens(address, account, network) {
    const SDK = new CryptoWalletJs();
    const api = networks[network];
    console.log(`FetchAll Tokens: ${api.coinName} -- ${network} -- ${address}`);
    const coinSDK = SDK.SDKFactory.createSDK('Ethereum', api);
    const ERC20SDK = SDK.SDKFactory.createSDK('ERC20', api);
    const txs = await coinSDK.getERC20History(
      address,
    );

    if (txs && txs.length > 0) {
      const erc20Tokens = [];

      const tokens = txs.reduce((r, a) => {
        r[a.contractAddress] = r[a.contractAddress] || [];
        r[a.contractAddress].push(a);
        return r;
      }, Object.create(null));

      const tokenObj = async (contract) => {
        const {
          tokenName,
          tokenSymbol,
          tokenDecimal,
        } = tokens[contract][0];

        const transactions = tokens[contract];

        const data = {
          name: tokenName,
          displayName: tokenName,
          sdk: 'ERC20',
          symbol: tokenSymbol,
          network,
          denomination: '0.00000000',
          parentSdk: api.coinName === 'Celo' ? api.coinName : 'Ethereum',
          parentName: api.coinName,
          contractAddress: contract,
          decimals: tokenDecimal,
          minConfirmations: 1,
          imported: true,
          api: networks[network],
        };

        await storeERC20Coin(data);

        data.account_id = account;
        data.imported = false;
        data.enabled = false;
        data.parentName = api.coinName === 'Celo' ? api.coinName : 'Ethereum';
        data.externalAddress = address;
        data.erc20Wallet = {
          decimals: tokenDecimal,
          address,
          network,
          name: tokenName,
          symbol: tokenSymbol,
          contract,
        };

        const wallet = await storeERC20Wallet(data, ERC20SDK);

        if (wallet.storeTxs) {
          const txPromises = [];
          transactions.forEach((tx) => {
            tx.account_id = account;
            tx.wallet_id = wallet;
            txPromises.push(storeTx(tx));
          });

          await Promise.all(txPromises);
        }

        erc20Tokens.push(data);
      };
      const promises = [];
      Object.keys(tokens).forEach(async (contract) => {
        promises.push(tokenObj(contract));
      });
      await Promise.all(promises);
      await Coin.fetchIcons();
      // await Coin.insert({ data: erc20Tokens });

      return erc20Tokens;
    }

    return null;
  }
}
