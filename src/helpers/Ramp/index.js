import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import Payments from '@/store/wallet/entities/payments';
import supportedCountries from '@/store/settings/state/rampSupportedCountries';

export function ramp(account, wallet, testnet = true) {
  const config = {
    hostAppName: 'Cent',
    hostLogoUrl: 'https://ramp-website.netlify.app/assets/images/Logo.svg',
    hostApiKey: 'bbt5vhccp62ryb92zfgetrdtwtwqdx78e28qap4m',
    // swapAsset: wallet.symbol,
    userAddress: wallet.externalAddress,
    userEmailAddress: account.email || '',
    variant: 'mobile',
  };
  if (testnet) { config.url = 'https://ri-widget-staging.firebaseapp.com/'; }

  return new RampInstantSDK(config);
}

export class Ramp {
  config = null;

  account = null;

  ramp = null;

  vm = null;

  constructor(vm, account, wallet, testnet) {
    this.vm = vm;
    this.account = account;
    this.config = {
      hostAppName: 'Cent',
      hostLogoUrl: 'https://ramp-website.netlify.app/assets/images/Logo.svg',
      swapAsset: wallet.symbol,
      userAddress: wallet.externalAddress,
      userEmailAddress: account.email || '',
      variant: 'mobile',
    };
    if (testnet) {
      this.config.url = 'https://ri-widget-staging.firebaseapp.com/';
    } else {
      this.config.hostApiKey = process.env.RAMP_KEY;
    }
  }

  open() {
    this.ramp = new RampInstantSDK(this.config);
    this.ramp.domNodes.overlay.style.zIndex = 998;
    this.ramp.domNodes.iframe.style.height = '96vh';
    this.ramp.domNodes.iframe.style.paddingTop = '35px';
    this.ramp.domNodes.iframe.style.maxWidth = '600px';
    this.vm.$store.dispatch('settings/setPaymentLoading', { on: true, logo: 'statics/payment-logos/ramp.svg' });
    setTimeout(() => {
      this.ramp.show();
      this.ramp.on('*', (data) => {
        if (data.type === 'WIDGET_CONFIG_DONE') { this.handleWidgetOpen(); }
        if (data.type === 'WIDGET_CLOSE') { this.handleWidgetClose(); }
      });
    // eslint-disable-next-line no-magic-numbers
    }, 500);

    // this.$emit('setProvider', this.transak);
  }

  close() {
    if (this.ramp) {
      this.ramp.unsubscribe('*', () => {});
    }
  }

  isAvailable() {
    if (this.account.country) {
      return supportedCountries.includes(this.account.country.label);
    }
    return false;
  }

  handleWidgetOpen() {
    setTimeout(() => {
      this.vm.$store.dispatch('settings/setPaymentLoading', { on: false, logo: null });

    // eslint-disable-next-line no-magic-numbers
    }, 1000);
  }

  handleWidgetClose() {
    this.ramp.unsubscribe('*', () => {});
  }

  handleOrderCreated(order) {
    if (order && order.type) {
      Payments.$insert({
        data: {
          id: order.payload.purchase.id,
          account_id: this.authenticatedAccount,
          wallet_id: this.id,
          address: this.wallet.externalAddress,
          event: order.type,
          status: order.type,
          isBuyOrSell: 'BUY',
          currency: order.payload.fiatCurrency,
          fiatAmount: order.payload.fiatValue,
          cryptoAmount: order.payload.cryptoAmount,
          conversionPrice: order.payload.assetExchangeRate,
          fromAddress: order.payload.escrowAddress,
          expires: order.payload.purchase.endTime,
        },
      });
    }
  }

  static handleOrderSuccess(order) {
    Payments.$update({
      where: order.status.id,
      data: {
        event: order.type,
        status: order.type,
      },
    });
  }
}
