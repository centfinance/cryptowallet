import TransakSDK from '@transak/transak-sdk';

export function transak(account, wallet, tokens, country, card = false, testnet = true) {
  return new TransakSDK({
    apiKey: testnet ? process.env.TRANSAK_DEV : process.env.TRANSAK_PROD, // Your API Key
    environment: testnet ? 'STAGING' : 'PRODUCTION', // STAGING/PRODUCTION
    cryptoCurrencyCode: wallet.symbol || '',
    cryptoCurrencyList: tokens || '',
    walletAddress: wallet.externalAddress, // Your customer's wallet address
    disableWalletAddressForm: true,
    themeColor: '#dd3dff', // App theme color
    fiatCurrency: country.currencyCode, // INR/GBP
    countryCode: country.alpha2,
    defaultPaymentMethod: card ? 'credit_debit_card' : '',
    email: account.email || '', // Your customer's email address
    redirectURL: window.location.origin,
    hostURL: window.location.origin,
    widgetHeight: '100%',
    widgetWidth: '100%',
    hideMenu: true,
    // exchangeScreenTitle: `Buy ${wallet.symbol.toUpperCase()}`,
  });
}
