/* eslint-disable class-methods-use-this */
import { openURL } from 'quasar';

export function altalix(vm, account, wallet) {
  // eslint-disable-next-line no-console
  console.log(account);
  // eslint-disable-next-line no-console
  console.log(wallet);
  return '<a href=https://app.altalix.com/partners/welcome?partner_id=99640323-1782-4939-a26b-eaf4c6d5e6df >Altalix</a>';
}

export class Altalix {
    config = null;

  account = null;

  vm = null;

  constructor(vm, account, wallet, testnet) {
    this.vm = vm;
    this.account = account;
    this.config = {
      hostAppName: 'Cent',
      hostLogoUrl: 'https://altalix.com/images/logo.png',
      swapAsset: wallet.symbol,
      userAddress: wallet.externalAddress,
      userEmailAddress: account.email || '',
      variant: 'mobile',
    };
    if (testnet) {
      this.config.url = 'https://ri-widget-staging.firebaseapp.com/';
    } else {
      this.config.hostApiKey = process.env.ALTALIX_KEY;
    }
  }

  open() {
    // this.transak.on(this.transak.ALL_EVENTS, (data) => {
    //   if (data.eventName === 'TRANSAK_WIDGET_OPEN') { this.handleWidgetOpen(); }
    //   if (data.eventName === 'TRANSAK_WIDGET_CLOSE') { this.handleWidgetClose(); }
    //   if (data.eventName === 'TRANSAK_ORDER_CREATED') { this.handleOrderCreated(data); }
    //   if (data.eventName === 'TRANSAK_ORDER_SUCCESSFUL') { Transak.handleOrderSuccess(data); }
    // });
    openURL('https://app.altalix.com/partners/welcome?partner_id=99640323-1782-4939-a26b-eaf4c6d5e6df', null,
      {
        noopener: true, // this is set by default for security purposes
        // but it can be disabled if specified with a Boolean false value
        menubar: false,
        toolbar: false,
        noreferrer: true,
      // .....any other window features
      });
    // this.vm.$store.dispatch('settings/setPaymentLoading', { on: true, logo: 'https://altalix.com/images/logo.png' });
  }

  isAvailable() {
    return true;
  }
}
