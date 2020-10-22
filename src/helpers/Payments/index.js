// eslint-disable-next-line no-unused-vars
const paymentOptions = [
  {
    type: 'Debit Card',
    icon: 'fas fa-credit-card',
    fee: '2.9%',
    time: 'Instant',
    caption: 'Lower Buy Limits',
    provider: 'ramp',
  },
  {
    type: 'Apple Pay',
    icon: 'fab fa-cc-apple-pay',
    fee: '2.9%',
    time: 'Instant',
    caption: 'Lower Buy Limits',
    provider: 'ramp',
  },
  {
    type: 'Credit/Debit Card',
    icon: 'fas fa-credit-card',
    fee: '3.9%',
    time: 'Instant',
    caption: 'Lower Buy Limits',
    provider: 'transak_credit_card',
  },
  {
    type: 'Instant Bank Transfer',
    icon: 'fas fa-university',
    fee: '1.9%',
    time: 'Instant',
    caption: 'No ID Required',
    provider: 'ramp',
  },
  {
    type: 'Manual Bank Transfer',
    icon: 'fas fa-university',
    fee: '0.5%',
    time: '1 - 3 hours',
    caption: 'KYC Required',
    provider: 'transak_bank_transfer',
  },
];


export function getProviders() {

}

