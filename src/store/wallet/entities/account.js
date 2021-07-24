import { Model } from '@vuex-orm/core';
import { Dark } from 'quasar';
import {
  refreshWallet,
} from '@/helpers';
import Coin from './coin';
import Wallet from './wallet';

/**
 * Account Entity.
 */
export default class Account extends Model {
  static entity = 'account';

  static AES = ['refresh_token'];

  static fields() {
    return {
      id: this.increment(),
      uid: this.attr(''),
      refresh_token: this.attr(null),
      salt: this.attr(''),
      pinHash: this.attr(''),
      name: this.attr(''),
      email: this.attr(null),
      locale: this.attr(''),
      country: this.attr(''),
      currency: this.attr(''),
      node: this.attr(''),
      default: this.attr(false),
      showTestnets: this.attr(true),
      darkMode: this.boolean(false),
      demoMode: this.boolean(false),
    };
  }

  static mutators() {
    return {
      darkMode(value) {
        Dark.set(value);
        return value;
      },
    };
  }

  get wallets() {
    return Wallet.query()
      .where('account_id', this.id)
      .where('imported', true)
      .get();
  }

  async updateBalances() {
    try {
      const coins = this.wallets
        .filter((wallet) => {
          return !wallet.erc20Wallet;
        });

      const coinPromises = coins.map((wallet) => {
        return refreshWallet(wallet, false);
      });
      await Promise.all(coinPromises);

      const tokenPromises = coins.map((wallet) => {
        return Coin.fetchAllTokens(
          wallet.externalAddress, this.id, wallet.network,
        );
      });
      await Promise.all(tokenPromises);
    } catch (err) {
      console.log(`UpdateBalances: ${err}`);
      // this.errorHandler(err);
    }
  }
}
