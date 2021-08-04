/* eslint-disable no-magic-numbers */
import { Model } from '@vuex-orm/core';
import { ethers } from 'ethers';
import { hdkey } from 'ethereumjs-wallet';
import Transactions from '@/store/transactions';
import networks from '@/store/settings/state/supportedNetworks';
import Coin from './coin';


/**
 * Wallet Entity.
 */
export default class Wallet extends Model {
  static entity = 'wallet';

  static AES = ['hdWallet'];

  static fields() {
    return {
      id: this.increment(),
      account_id: this.attr(''),
      name: this.attr(''),
      displayName: this.attr(''),
      symbol: this.attr(''),
      sdk: this.attr(''),
      network: this.attr(''),
      chainId: this.attr(''),
      internalChainAddressIndex: this.attr(0),
      externalChainAddressIndex: this.attr(0),
      externalAddress: this.attr(null),
      confirmedBalance: this.attr(0),
      unconfirmedBalance: this.attr(0),
      imported: this.attr(false),
      enabled: this.attr(false),
      lastBlockHeight: this.attr(0),
      parentName: this.attr(''),
      parentSdk: this.attr(''),
      contractAddress: this.attr(''),
      decimals: this.attr(18),
      hdWallet: this.attr(''),
      erc20Wallet: this.attr(''),
      demoMode: this.attr(false),
    };
  }

  get identifier() {
    const coin = Coin.query()
      .where('name', this.name)
      .where('contractAddress', this.contractAddress)
      .get()[0];

    if (coin) {
      if (coin.sdk === 'ERC20') {
        return this.contractAddress;
      }

      return coin.identifier;
    }
    return '';
  }

  get parentWallet() {
    if (this.hdWallet) {
      return null;
    }
    return Wallet.query()
      .where('account_id', this.account_id)
      .where('name', this.parentName)
      .get()[0];
  }

  get privateKey() {
    const hd = this.erc20Wallet
      ? this.parentWallet.hdWallet
      : this.hdWallet;
    if (hd.ext) {
      return hdkey.fromExtendedKey(hd.ext.xpriv).deriveChild(0)
        .getWallet().getPrivateKeyString();
    }
    return null;
  }

  get signer() {
    if (!this.privateKey) { return null; }
    const url = networks[this.network].provider;
    const provider = new ethers.providers.JsonRpcProvider(url);
    return new ethers.Wallet(this.privateKey, provider);
  }

  newTx(data) {
    // eslint-disable-next-line camelcase
    const { account_id, id } = this;
    const tx = {
      account_id,
      wallet_id: id,
      ...data,
    };
    return Transactions.insert({
      data: tx,
    });
  }
}
