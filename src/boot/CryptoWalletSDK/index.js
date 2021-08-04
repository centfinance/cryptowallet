import CryptoWalletSDK from 'cryptowallet-js';
import networks from '../../store/settings/state/supportedNetworks';

export default ({ Vue }) => {
  const SDK = new CryptoWalletSDK();

  Vue.prototype.coinSDKS = {
    Bitcoin: SDK.SDKFactory.createSDK('Bitcoin'),
    Ethereum: (network = 'ETHEREUM') => {
      return SDK.SDKFactory.createSDK('Ethereum', networks[network]);
    },
    ERC20: (network = 'ETHEREUM') => {
      return SDK.SDKFactory.createSDK('ERC20', networks[network]);
    },
    Celo: (network = 'CELO') => {
      return SDK.SDKFactory.createSDK('Celo', networks[network]);
    },
  };
};
