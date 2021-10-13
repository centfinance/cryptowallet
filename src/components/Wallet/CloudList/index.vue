<template>
  <div class="cloud-list">
    <div v-if="wallets.length === 0">
      <q-btn
        icon="add_circle_outline"
        label="add"
        color="primary"
        size="xl"
        class="large-cloud-btn"
        @click.prevent="openWalletsModal"
      />
    </div>
    <q-scroll-area
      v-if="wallets.length > 0"
      ref="scrollArea"
      class="scroll-area extended cloud-scroll q-pt-lg"
    >
      <div
        style="color:grey"
        class="row q-mb-sm grey justify-between text-h6 text-weight-bold"
      >
        <div>
          <q-icon
            size="xs"
            name="account_balance_wallet"
          />
          My Balance
          <div
            v-if="testMode"
            class="text-caption text-red"
          >
            Connected to Test network
          </div>
        </div>
        <div class="q-px-xs grey">
          {{ totalBalanceFormatted }}
          <!-- <q-btn
            flat
            round
            size="sm"
            color="info"
            icon="add"
            class="bg-accent"
            @click.prevent="openWalletsModal"
          /> -->
        </div>
      </div>
      <div class="container">
        <q-tabs
          v-model="tab"
          color="blueish"
          inverted
        >
          <template
            v-for="w in wallets"
          >
            <q-tab
              :key="w.id"
              class="text-overline text-orange-9"
              default
              :name="w.network"
            >
              <div class="text-overline text-weight-bold text-orange-9">
                <q-avatar size="20px">
                  <img
                    v-if="w.network.includes('ETHEREUM')"
                    src="~/assets/ethereum.svg"
                  >
                  <img
                    v-if="w.network.includes('XDAI')"
                    src="~/assets/xdai.png"
                  >
                  <img
                    v-if="w.network.includes('CELO')"
                    src="~/assets/celo.svg"
                  >
                </q-avatar>&nbsp;
                <span
                  Wallet
                >{{ getTabLabel(w.displayName,fetchWallet(w.network).length) }}
                </span>
              </div>
            </q-tab>
          </template>
        </q-tabs>
        <q-tab-panels
          v-model="tab"
          animated
        >
          <template
            v-for="w in wallets"
          >
            <q-tab-panel
              :key="w.id"
              :name="w.network"
            >
              <CloudListCard
                :key="w.id"
                :wallet="fetchWallet(w.network)"
                :network="w.name"
                :display="w.displayName"
                :address="w.externalAddress"
                @cardBalanace="cardBalanaceRecd"
              />
            </q-tab-panel>
          </template>
        </q-tab-panels>
      </div>
    </q-scroll-area>
    <WalletConnect />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import CloudListCard from '@/components/Wallet/CloudListCard';

import Wallet from '@/store/wallet/entities/wallet';
import Coin from '@/store/wallet/entities/coin';
import WalletConnect from '@/components/WalletConnect/WalletConnect';

// import * as web3Solana from '@solana/web3.js';
import * as bip39 from 'bip39';
// import { derivePath } from 'ed25519-hd-key';
// import * as bip32 from 'bip32';
// import * as nacl from 'tweetnacl';

import {
  AmountFormatter,
  getBalance,
  // refreshWallet,
} from '@/helpers';

export default {
  name: 'CloudList',
  components: {
    CloudListCard,
    WalletConnect,
  },

  data() {
    return {
      scrollPosition: 0,
      tab: 'ETHEREUM',
      interval: 15000,
      totalAssets: 0,
      checkForUpdates: null,
      connectWalletXDAI: false,
      chainId: null,
      address: null,
      totalBalance: 0,
      totalBalanceFormatted: '0',
      networkBalance: [],
      // eslint-disable-next-line no-magic-numbers
      mainNetIds: [1, 42220, 100],
      // eslint-disable-next-line no-magic-numbers
      testNetIds: [44787, 42],
      buy: false,
    };
  },

  computed: {
    ...mapState({
      id: (state) => { return state.route.params.id; },
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      modals: (state) => { return state.modals; },
      xDaiWallet: null,
    }),
    // eslint-disable-next-line vue/no-async-in-computed-properties
    wallets() {
    //  const connection = new web3Solana.Connection('http://testnet.solana.com');
      // eslint-disable-next-line max-len
      // const sk = '[141,50,32,156,170,204,254,253,76,170,171,162,239,252,147,230,185,135,5,130,41,252,52,162,23,68,0,179,125,112,135,132,194,170,209,149,120,82,109,129,237,100,120,137,164,215,27,196,222,154,83,84,41,73,238,46,153,211,222,230,232,191,181,238]';
      // eslint-disable-next-line max-len
      // const mnemonic = 'protect solar giant gate hero output slide unfold isolate kingdom alley vague giraffe wheat task disagree sentence hawk trade gentle pigeon marble truly option';
      // console.log('KP from seed Generating');
      // const seed = bip39.mnemonicToSeed(k);
      // // eslint-disable-next-line no-magic-numbers
      // const c1 = seed.slice(0, 32);
      // // eslint-disable-next-line no-magic-numbers
      // const c2 = seed.slice(32, 64);
      // const c3 = nacl.scalarMult(c1, c2);

      // // eslint-disable-next-line no-magic-numbers
      // const kp = web3Solana.Keypair.fromSeed(c3);

      // console.log(JSON.stringify(kp));


      // Approach 2
      // eslint-disable-next-line vue/no-async-in-computed-properties
      // console.log(mnemonic);
      // const seed = bip39.mnemonicToSeed(mnemonic);
      // eslint-disable-next-line max-len
      // const seed = this.getSeed(mnemonic); // Buffer.from(k.trim().split(/\s+/g).join(' '), 'hex');
      // console.log(seed)

      // const walletIndex = 0;
      // const accountIndex = 0;

      // eslint-disable-next-line max-len
      // const derivedSeed = derivePath(Buffer.from(seed).toString('hex'), 'm/44\'/501\'/0\'/0').privateKey;
      // console.log(derivedSeed);
      // const kp = nacl.sign.keyPair.fromSeed(derivedSeed);
      // console.log(JSON.stringify(kp));
      // const account = new web3Solana.Account(kp.secretKey);
      // console.log(account.publicKey.toString());
      // console.log(account);


      // eslint-disable-next-line vue/no-async-in-computed-properties
      // const ac = await connection.getAccountInfo(account.publicKey);
      // console.log('account fetched from testnet');
      // console.log(JSON.stringify(ac));
      const wallets = Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .get();
      if (this.testMode) {
        return wallets.filter((w) => {
          return this.testNetIds.includes(w.chainId);
        });
      }
      return wallets.filter((w) => {
        return this.mainNetIds.includes(w.chainId);
      });
    },
    getSeed(mnemonic) {
      // if (!bip39.validateMnemonic(mnemonic)) {
      //   throw new Error('Invalid seed words');
      // }
      const seed = bip39.mnemonicToSeed(mnemonic);
      return Buffer.from(seed).toString('hex');
    },
    account() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount);
    },
    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },
    showTestnets() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount).showTestnets;
    },
    testMode() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount).testMode;
    },
    demoMode() {
      // return true;
      return this.$store.getters['entities/account/find'](this.authenticatedAccount).demoMode;
    },
    testnets() {
      const coins = Coin.query()
        .where('testnet', true).get();
      return coins.map(({ network }) => { return network; });
    },
  },
  watch: {
    '$q.appVisible': function appVisible(val) {
      if (!val) {
        clearInterval(this.checkForUpdates);
      } else {
        this.updateInterval();
      }
    },
    testMode() {
      this.networkBalance = [];
    },
  },

  async activated() {
    await this.updateInterval();
    if (document.querySelectorAll('.cloud-scroll .scroll')[0]) {
      document.querySelectorAll('.cloud-scroll .scroll')[0].scrollTop = this.scrollPosition;
    }
  },

  deactivated() {
    clearInterval(this.checkForUpdates);
  },
  mounted() {
    setInterval(() => {
      this.getTotalBalance();
    }, this.interval);
  },
  methods: {
    getTotalBalance() {
      this.totalBalance = 0;
      const mainWallets = this.wallets;
      mainWallets.forEach((w) => {
        this.fetchWallet(w.network).forEach((wallet) => {
          const { unconfirmed } = getBalance(wallet, this.authenticatedAccount);
          const price = this.$store.getters['entities/latestPrice/find'](`${wallet.symbol === 'CELO' ? 'celo' : wallet.identifier}_${this.selectedCurrency.code}`);
          if (price) {
            const formattedAmount = new AmountFormatter({
              amount: unconfirmed,
              rate: price.data.PRICE,
              format: '0.00',
              coin: wallet.name,
              prependPlusOrMinus: false,
              currency: this.selectedCurrency,
              toCurrency: true,
              toCoin: false,
              withCurrencySymbol: false,
            });

            // eslint-disable-next-line max-len
            this.totalBalance += parseFloat(formattedAmount.getFormatted());
            this.totalBalanceFormatted = this.getFormattedBalance(this.totalBalance);
          }
        });
      });
    },
    getTabLabel(name, length) {
      return `${name} (${length})`;
    },
    cardBalanaceRecd(val) {
      const obj = this.networkBalance.filter((item) => {
        return item.network === val.network;
      });
      if (obj.length > 0) {
        obj.balance = val.balance;
      } else {
        this.networkBalance.push(val);
      }
    },
    getFormattedBalance(bal) {
      const formattedBalance = new AmountFormatter({
        amount: bal,
        format: '0,0[.]00',
        currency: this.selectedCurrency,
        toCurrency: false,
        toCoin: false,
        withCurrencySymbol: true,
      });

      return formattedBalance.getFormatted();
    },

    receive() {
      this.$router.push({ path: `/wallet/single/receive/${this.wallet.id}` });
    },
    getBalance(wallets) {
      let balance = 0;
      wallets.forEach((wallet) => {
        const { unconfirmed } = getBalance(wallet, this.authenticatedAccount);

        const price = this.$store.getters['entities/latestPrice/find'](`${wallet.identifier}_${this.selectedCurrency.code}`);
        if (price) {
          const formattedAmount = new AmountFormatter({
            amount: unconfirmed,
            rate: price.data.PRICE,
            format: '0.00',
            coin: wallet.name,
            prependPlusOrMinus: false,
            currency: this.selectedCurrency,
            toCurrency: true,
            toCoin: false,
            withCurrencySymbol: false,
          });

          balance += parseFloat(formattedAmount.getFormatted());
        }
      });
      return balance;
    },
    fetchWallet(networkType) {
      const wallets = Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .where('imported', true)
        .where('network', networkType)
        .get();
      if (!this.showTestnets) {
        return wallets.filter(({ network }) => {
          return !this.testnets.includes(network);
        });
      }
      if (wallets.length < 1) { return []; }
      if (networkType === 'CELO' || networkType === 'CELO_ALFAJORES') {
        if (wallets.length > 1) {
          return wallets.filter((wallet) => { return wallet.parentName !== ''; });
        }
      }
      return wallets;
    },

    toggleVisibility() {
      this.visible = !this.visible;
    },
    togglexDaiVisibility() {
      this.xDaivisible = !this.xDaivisible;
    },
    toggleCeloVisibility() {
      this.Celovisible = !this.Celovisible;
    },
    openWalletsModal() {
      this.$store.dispatch('modals/setAddWalletModalOpened', true);
    },

    // openSelectCoinModal(wallet, buy = false) {
    //   this.selectCoinWallet = wallet;
    //   this.buy = buy;
    //   this.$store.dispatch('modals/setSelectCoinModalOpened', true);
    // },
    touchStart(event) {
      this.touchStartY = event.touches[0].clientY;
    },

    touchMove(event) {
      if (event.touches[0].clientY <= this.touchStartY) {
        event.stopPropagation();
      }

      if (this.wallets.length === 0 || !this.$refs.scrollArea) { return false; }
      if (this.$refs.scrollArea.$el.childNodes[0].scrollTop !== 0) {
        event.stopPropagation();
      }

      return true;
    },

    async updateInterval() {
      clearInterval(this.checkForUpdates);
      this.checkForUpdates = setInterval(async () => {
        if (Object.values(this.modals).every((i) => { return !i; })) {
          await this.account.updateBalances();
        }
      }, this.interval);
    },

    scrolled(data) {
      this.scrollPosition = data.position;
      const pixels = 100;
      if (data.position > pixels && data.direction === 'down') {
        this.$root.$emit('isHomeBalanceVisible', false);
      }
      if (data.position <= pixels && data.direction === 'up') {
        this.$root.$emit('isHomeBalanceVisible', true);
      }
    },

  },
};
</script>

<style>
.cloud-list .scroll-area {
  position: absolute;
  height: calc(100% - -10rem);
  width: 100%;
  left: 0;
  top: -2rem;
}

body.q-ios-padding .cloud-list .scroll-area {
  height: calc(100% - 10rem - 4rem - env(safe-area-inset-bottom));
}

.large-cloud-btn {
  width: 100%;
  height: 3em;
  border-radius: 0.4rem;
  font-size: 3em;
  padding: 0em;
  color: white;
  margin-top: 15.5rem;

}

.large-cloud-btn i {
  color: white;
}

.large-cloud-btn .q-btn__content{
  color: white
}

.scroll-offset {
  height: 20rem;
}
</style>
