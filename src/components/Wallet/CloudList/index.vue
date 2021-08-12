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
      <template
        v-for="w in wallets"
      >
        <CloudListCard
          :key="w.id"
          :wallet="fetchWallet(w.network)"
          :network="w.name"
          :display="w.displayName"
          :address="w.externalAddress"
          @cardBalanace="cardBalanaceRecd"
        />
      </template>
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
      interval: 15000,
      totalAssets: 0,
      checkForUpdates: null,
      connectWalletXDAI: false,
      chainId: null,
      address: null,
      totalBalance: 0,
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
    wallets() {
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

      // if (!this.showTestnets) {
      //   return wallets.filter(({ network }) => {
      //     return !this.testnets.includes(network);
      //   });
      // }
      // return wallets;
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
    totalBalanceFormatted() {
      let b = 0;
      this.networkBalance.forEach((item) => {
        b += item.balance;
      });
      return this.getFormattedBalance(b);
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
  methods: {
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
  height: calc(100% - 19rem);
  width: 100%;
  left: 0;
  top: 10rem;
}

body.q-ios-padding .cloud-list .scroll-area {
  height: calc(100% - 15rem - 4rem - env(safe-area-inset-bottom));
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
