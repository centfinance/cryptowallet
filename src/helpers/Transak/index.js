import TransakSDK from '@transak/transak-sdk';
import Payments from '@/store/wallet/entities/payments';

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
  });
}

export class Transak {
  config = null;

  account = null;

  transak = null;

  vm = null;

  constructor(vm, account, wallet, tokens, card = false, testnet = true) {
    this.vm = vm;
    this.account = account;
    this.config = {
      apiKey: testnet ? process.env.TRANSAK_DEV : process.env.TRANSAK_PROD, // Your API Key
      environment: testnet ? 'STAGING' : 'PRODUCTION', // STAGING/PRODUCTION
      cryptoCurrencyCode: wallet.symbol || '',
      // cryptoCurrencyList: tokens || '',
      walletAddress: wallet.externalAddress, // Your customer's wallet address
      disableWalletAddressForm: true,
      themeColor: '#dd3dff', // App theme color
      fiatCurrency: account.country.value.currencyCode, // INR/GBP
      countryCode: account.country.value.alpha2,
      defaultPaymentMethod: card ? 'credit_debit_card' : '',
      email: account.email || '', // Your customer's email address
      redirectURL: window.location.origin,
      hostURL: window.location.origin,
      widgetHeight: '100%',
      widgetWidth: '100%',
      hideMenu: true,
      networks: 'ethereum',
    };
    this.transak = new TransakSDK(this.config);
  }

  open() {
    this.transak.on(this.transak.ALL_EVENTS, (data) => {
      if (data.eventName === 'TRANSAK_WIDGET_OPEN') { this.handleWidgetOpen(); }
      if (data.eventName === 'TRANSAK_WIDGET_CLOSE') { this.handleWidgetClose(); }
      if (data.eventName === 'TRANSAK_ORDER_CREATED') { this.handleOrderCreated(data); }
      if (data.eventName === 'TRANSAK_ORDER_SUCCESSFUL') { Transak.handleOrderSuccess(data); }
    });
    this.vm.$store.dispatch('settings/setPaymentLoading', { on: true, logo: 'statics/payment-logos/transak.png' });
    this.transak.init();
  }

  close() {
    try {
      this.transak.removeAllListeners();
    } catch {
      // eslint-disable-next-line no-console
      console.error('implement transak removeAllListeners function');
    }
  }

  isAvailable() {
    if (this.config.defaultPaymentMethod !== 'credit_debit_card') {
      return this.account.country.value.partners
        .some((partner) => { return (!partner.isCardPayment); });
    }
    return this.account.country.value.partners
      .some((partner) => { return (!!partner.isCardPayment); });
  }

  handleWidgetOpen() {
    setTimeout(() => {
      this.vm.$store.dispatch('settings/setPaymentLoading', { on: false, logo: null });
      // eslint-disable-next-line no-magic-numbers
    }, 1000);
  }

  handleWidgetClose() {
    this.transak.close();
    this.transak.isInitialised = false;
    try {
      this.transak.removeAllListeners();
    } catch {
      // eslint-disable-next-line no-console
      console.error('implement transak removeAllListeners function');
    }
  }

  handleOrderCreated(order) {
    if (order && order.status) {
      Payments.$insert({
        data: {
          id: order.status.id,
          account_id: this.authenticatedAccount,
          wallet_id: this.id,
          address: this.wallet.externalAddress,
          event: order.eventName,
          status: order.status.status,
          isBuyOrSell: order.status.isBuyOrSell,
          currency: order.status.fiatCurrency,
          fiatAmount: order.status.fiatAmount,
          cryptoAmount: order.status.cryptoAmount,
          conversionPrice: order.status.conversionPrice,
          totalFeeInCrypto: order.status.totalFeeInCrypto,
          totalfeeInFiat: order.status.totalFeeInFiat,
          paymentOption: order.status.paymentOption[0],
          fromAddress: order.status.fromWalletAddress,
          expires: order.status.autoExpiresAt,
        },
      });
    }
  }

  static handleOrderSuccess(order) {
    Payments.$update({
      where: order.status.id,
      data: {
        event: order.eventName,
        status: order.status.status,
      },
    });
  }
}
