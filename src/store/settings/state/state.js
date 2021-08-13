import coins from './coins.js';
import currencies from './currencies.js';
import supportedCoins from './supportedCoins.js';
import supportedCurrencies from './supportedCurrencies.js';

export default {
  pin: {
    minLength: 6,
  },
  acNode: {},
  coins,
  currencies,
  supportedCoins,
  supportedCurrencies,
  selectedCurrency: currencies.GBP,
  loading: true,
  selectedAccount: null,
  layout: 'dark',
  wcRequestPending: false,
  delay: {
    vshort: 50,
    short: 200,
    normal: 500,
    long: 1000,
    vlong: 3000,
  },
  disablePullToRefresh: false,
  paymentLoading: { on: false, logo: null },
  // eslint-disable-next-line no-magic-numbers
  mainNetIds: [1, 42220, 100],
  // eslint-disable-next-line no-magic-numbers
  testNetIds: [44787, 42],
  walletConnectPayload: null,
};
