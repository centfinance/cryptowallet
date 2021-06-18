/* eslint-disable no-magic-numbers */
import Notify from 'bnc-notify';

const chainIds = [1, 3, 4, 5, 42, 100, 44787, 42220];

export function trackTx(hash, networkId, darkMode = false) {
  if (chainIds.includes(networkId)) {
    const notify = Notify({
      dappId: '976c8475-c84c-45c8-aec0-685e2591f4cb', // [String] The API key created by step one above
      system: 'ethereum',
      networkId, // [Integer] The Ethereum network ID your Dapp uses.
      darkMode,
    });

    const { emitter } = notify.hash(hash);
    return emitter;
  }
  return null;
}

export default ({ Vue }) => {
  Vue.prototype.$trackTx = trackTx;
};
