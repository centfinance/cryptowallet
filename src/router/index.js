import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export default new VueRouter({
  /**
   * Gets scroll position
   * @returns {{y: number}}
   */
  scrollBehavior: () => { return { y: 0 }; },

  routes: [
    {
      path: '/',
      component: () => { return import('@/layouts/UnAuthed'); },
      children: [
        { path: '', component: () => { return import('@/pages/Auth/Login'); } },
      ],
    },
    {
      path: '/setup/:id',
      component: () => { return import('@/layouts/UnAuthed'); },
      children: [
        { name: 'setup', path: '', component: () => { return import('@/pages/Setup'); } },
      ],
    },
    {
      path: '/settings',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'settings', path: '', component: () => { return import('@/pages/Settings'); } },
      ],
    },
    {
      path: '/wallet',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'wallet', path: '', component: () => { return import('@/pages/Wallet'); } },
      ],
    },
    {
      path: '/walletconnect',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'walletconnect', path: '', component: () => { return import('@/pages/WalletConnect'); } },
      ],
    },
    {
      path: '/wallet/single/:id',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'walletSingle', path: '', component: () => { return import('@/pages/WalletSingle'); } },
      ],
    },
    {
      path: '/wallet/single/prices/:id',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'coinSinglePrices', path: '', component: () => { return import('@/pages/WalletSingle'); } },
      ],
    },
    {
      path: '/wallet/single/send/:id',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'sendCoinSingle', path: '', component: () => { return import('@/pages/WalletSingle'); } },
      ],
    },
    {
      path: '/wallet/send/:id',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'sendCoin', path: '', component: () => { return import('@/pages/Wallet'); } },
      ],
    },
    {
      path: '/wallet/single/receive/:id',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'receiveCoinSingle', path: '', component: () => { return import('@/pages/WalletSingle'); } },
      ],
    },
    {
      path: '/wallet/single/add-funds/:id',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'buyCryptoSingle', path: '', component: () => { return import('@/pages/WalletSingle'); } },
      ],
    },
    {
      path: '/wallet/add-funds/',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'buyCrypto', path: '', component: () => { return import('@/pages/Wallet'); } },
      ],
    },
    {
      path: '/wallet/single/sell-funds/:id',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'sellCryptoSingle', path: '', component: () => { return import('@/pages/WalletSingle'); } },
      ],
    },
    {
      path: '/wallet/sell-funds/',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'sellCrypto', path: '', component: () => { return import('@/pages/Wallet'); } },
      ],
    },
    {
      path: '/wallet/receive/:id',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'receiveCoin', path: '', component: () => { return import('@/pages/Wallet'); } },
      ],
    },
    {
      path: '/wallet/history/:id',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'coinHistory', path: '', component: () => { return import('@/pages/Wallet'); } },
      ],
    },
    {
      path: '/wallet/prices/:id',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'coinPrices', path: '', component: () => { return import('@/pages/Wallet'); } },
      ],
    },
    {
      path: '/wallet/exchange',
      component: () => { return import('@/layouts/Authed'); },
      children: [
        { name: 'exchange', path: '', component: () => { return import('@/pages/Exchange'); } },
      ],
    },
    {
      path: '*',
      component: () => { return import('@/layouts/UnAuthed'); },
      children: [
        { name: '404', path: '', component: () => { return import('@/pages/Error/404'); } },
      ],
    },
  ],

  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
});