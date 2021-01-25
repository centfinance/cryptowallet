/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable no-underscore-dangle */
import Vue from 'vue';
import Vuex from 'vuex';
import VuexORM from '@vuex-orm/core';
// import VuexORMLoki from '@atlascity/vuex-orm-plugin-lokijs';
// import VuexORMLocalForage from 'vuex-orm-localforage';
import VuexORMCordova from 'vuex-orm-cordova';
// import localforage from 'localforage';
// import cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
// import localforage from 'localforage';
// import cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

// import entities.
import Account from './wallet/entities/account';
import Address from './wallet/entities/address';
import Tx from './wallet/entities/tx';
import Utxo from './wallet/entities/utxo';
import Wallet from './wallet/entities/wallet';
import Coin from './wallet/entities/coin';
import KeyPair from './wallet/entities/keyPair';
import Prices from './prices';
import LatestPrice from './latestPrice';
import Fees from './fees';
import Payments from './wallet/entities/payments';
import Token from './wallet/entities/token';
import Transactions from './transactions';

const models = [
  Account,
  Address,
  Tx,
  Utxo,
  Wallet,
  Coin,
  KeyPair,
  Prices,
  LatestPrice,
  Fees,
  Payments,
  Token,
];

// import modules.
import settings from './settings';
import setup from './setup';
import qrcode from './qrcode';
import modals from './modals';

Vue.use(Vuex);

// Setup ORM database.
const database = new VuexORM.Database();

models.forEach((model) => {
  database.register(model, {});
});

// database.register(Account, {});
// database.register(Address, {});
// database.register(Tx, {});
// database.register(Utxo, {});
// database.register(Wallet, {});
// database.register(Coin, {});
// database.register(KeyPair, {});
// database.register(Prices, {});
// database.register(LatestPrice, {});
// database.register(Fees, {});
// database.register(Payments, {});
// database.register(Token, {});

Vue.prototype.encryptedModels = [
  Account,
  Wallet,
];

if (process.env.DEV) {
  window.Tx = Tx;
  window.Utxo = Utxo;
  window.Address = Address;
  window.Wallet = Wallet;
  window.LatestPrice = LatestPrice;
  window.Prices = Prices;
  window.Account = Account;
  window.Coin = Coin;
  window.Fees = Fees;
  window.Payments = Payments;
  window.Token = Token;
  window.Transactions = Transactions;
}

// const options = {
//   env: 'browser',
// };

VuexORM.use(VuexORMCordova, {
  database,
  actions: {
    $get: '$get',
    $fetch: '$fetch',
    $create: '$insert',
    $update: '$update',
    $replace: '$create',
    $delete: '$delete',
    $deleteAll: '$deleteAll',
  },
});

/**
 * Create CryptoWallet Vuex store obj.
 * @type {Store<any>}
 */
const store = new Vuex.Store({
  modules: {
    settings,
    setup,
    qrcode,
    modals,
  },
  plugins: [VuexORM.install(database)],
});

function hydrationCompletedCallback() {
  const delay = 1000;
  setTimeout(() => {
    store.dispatch('settings/setLoading', false);
  }, delay);
}

export function hydrateStore() {
  const promises = [];
  models.forEach((model) => {
    promises.push(model.$fetch());
  });
  Promise.all(promises).then(() => {
    console.log("Calling hydration call back");
    hydrationCompletedCallback();
  });
}

// VuexORM.use(VuexORMLoki, { database, options, hydrationCompletedCallback });


Vue.prototype.activeWallets = {};

export default store;
