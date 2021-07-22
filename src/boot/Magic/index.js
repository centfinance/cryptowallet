import { Magic, RPCError, RPCErrorCode } from 'magic-sdk';

import bip39 from 'bip39';
import { ethers } from 'ethers';
import { Web3 } from 'web3';

const m = new Magic(process.env.MAGIC_PROD); // ✨

// eslint-disable-next-line no-console
m.preload().then(() => { return console.log('Magic <iframe> loaded.'); });

const magic = {
  async login(email) {
    // log in a user by their email
    try {
      await m.auth.loginWithMagicLink({ email });
      return true;
    } catch {
    // Handle errors if required!
      return false;
    }
  },

  async logout() {
    await m.user.logout();
  },

  async isLoggedIn() {
    try {
      return await m.user.isLoggedIn();
    } catch {
      return false;
      // Handle errors if required!
    }
  },

  async updateEmail(email) {
    try {
      await m.user.updateEmail({ email });
      return true;
    } catch (err) {
      if (err instanceof RPCError) {
        switch (err.code) {
          case RPCErrorCode.UpdateEmailFailed:
            // Handle errors accordingly :)
            break;
          // eslint-disable-next-line no-console
          default: console.error(err);
        }
      } else {
        // eslint-disable-next-line no-console
        console.error(err);
      }
      return false;
    }
  },

  async getUser() {
    // Assumes a user is already logged in
    try {
      return await m.user.getMetadata();
    } catch {
      // Handle errors if required!
      return false;
    }
  },

  async getProvider() {
    const provider = new ethers.providers.Web3Provider(m.rpcProvider);
    return provider.getSigner();
  },

  async getCeloProvider() {
    const provider = new Web3(m.rpcProvider);
    console.log(`CeloProvider: ${provider}`);
  },

  async getMnemonic() {
    const provider = await this.getProvider();
    const entropy = await provider.signMessage('cryptowallet');
    const entropyBuffer = Buffer.from(entropy);
    const maxBytes = 32;
    const mnemonic = bip39.entropyToMnemonic(entropyBuffer.slice(0, maxBytes));
    return mnemonic;
  },
};

export default ({ Vue }) => {
  Vue.prototype.$magic = magic;
};
