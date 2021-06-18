<template>
  <div classs="flex">
    <div
      class="transaction-notification"
    >
      <q-dialog
        v-model="showTxNotification"
        seamless
        position="bottom"
        :content-class="getClass"
      >
        <div
          v-if="newTxModalData"
          class="row justify-between"
        >
          <div class="col-2">
            <img
              :src="newTxModalData.logo"
              class="coin-logo"
            >
          </div>
          <div class="label col-6">
            {{ $t('newTxIntro') }} {{ newTxModalData.value }} {{ newTxModalData.symbol }}!
          </div>
          <div class="button-grp col-4">
            <q-btn
              flat
              :label="$t('view')"
              @click="viewTx(newTxModalData.id, newTxModalData.wallet_id)"
            />
            <q-btn
              v-close-popup
              flat
              icon="close"
              @click="closeNotification"
            />
          </div>
        </div>
      </q-dialog>
    </div>
    <section
      v-if="!hideHeader"
      class="main-header row justify-between q-px-sm"
    >
      <div>
        <q-btn
          :class="{ hideBackButton: !isBackButtonEnabled }"
          :disable="!isBackButtonEnabled"
          icon="arrow_back"
          color="secondary"
          size="lg"
          class="icon-btn back-arrow-btn"
          flat
          @click.prevent="goBack"
        />
      </div>

      <div v-if="coinHeading">
        <h1 class="text-accent header-h1">
          <img
            :src="coinLogo"
            class="coin-logo token-icon"
          >
          {{ wallet.displayName }}
        </h1>
      </div>
      <div v-else>
        <div v-if="heading === 'Settings' || heading=== 'Wallet Connect'">
          <h1 class="header-h1 text-accent">
            {{ heading }}
          </h1>
        </div>
        <div v-else>
          <img
            v-if="!walletScreen && dark"
            class="header-logo q-mt-xs"
            src="~/assets/cent-logo-white.svg"
          >
          <img
            v-else-if="!walletScreen"
            class="header-logo q-mt-xs"
            src="~/assets/cent-logo-black.svg"
          >
        </div>
      </div>
      <div
        class="q-mt-xs"
        style="min-width: 40px;"
      >
        <!-- <div
          v-if="displayAddWallet"
        >
          <q-btn
            icon="add"
            color="primary"
            size="lg"
            class="icon-btn icon-btn-right"
            flat
            @click.prevent="openWalletsModal"
          />
        </div> -->

        <!-- <div
          v-if="displayPriceChart"
        >
          <q-btn
            icon="timeline"
            color="secondary"
            size="lg"
            class="icon-btn icon-btn-right"
            flat
            @click.prevent="openChartModal"
          />
        </div> -->

        <!-- <div
          v-if="displayAccounts"
        >
          <q-btn
            icon="people"
            color="primary"
            size="lg"
            class="icon-btn icon-btn-right"
            flat
            @click.prevent="setAccountModalOpened(true)"
          />
        </div> -->
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Coin from '@/store/wallet/entities/coin';


export default {
  name: 'Header',
  data() {
    return {
      isBackButtonEnabled: false,
      newTxModalData: null,
      showTxNotification: false,
      enableTxNotification: true,
    };
  },

  computed: {
    ...mapState({
      id: (state) => { return state.route.params.id; },
      delay: (state) => { return state.settings.delay; },
      modals: (state) => { return state.modals; },
      walletType: (state) => { return state.settings.walletType; },
    }),

    dark() {
      return this.$q.dark.isActive;
    },

    coin() {
      return Coin.query()
        .where('name', this.wallet.name)
        .where('contractAddress', this.wallet.contractAddress)
        .get()[0];
    },

    wallet() {
      return this.$store.getters['entities/wallet/find'](this.id);
    },

    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },

    displayAccounts() {
      return this.$route.path === '/';
    },

    displayAddWallet() {
      return this.$route.path === '/wallet';
    },

    displayPriceChart() {
      if (this.wallet && this.selectedCurrency) {
        const price = this.$store.getters['entities/latestPrice/find'](`${this.wallet.identifier}_${this.selectedCurrency.code}`);
        if (price) {
          return this.$route.name === 'walletSingle'
                || this.$route.name === 'sendCoinSingle';
        }
      }
      return false;
    },

    heading() {
      if (this.$route.name === 'setup') { return ''; }
      if (this.$route.name === 'exchange') { return this.$t('exchange'); }
      if (this.$route.name === 'settings') { return this.$t('settings'); }
      if (this.$route.name === 'walletconnect') { return this.$t('walletConnect'); }
      return 'Cent';
    },

    coinHeading() {
      if (this.$route.name === 'walletSingle'
          || this.$route.name === 'sendCoinSingle'
          || this.$route.name === 'receiveCoinSingle'
          || this.$route.name === 'coinSinglePrices') {
        return true;
      }
      return false;
    },

    walletScreen() {
      return this.$route.name === 'wallet' || this.$route.name === 'addFunds' || this.$route.name === 'receiveCoin';
    },

    getClass() {
      if (this.$route.name === 'walletSingle' || this.$route.name === 'wallet'
      || this.$route.name === 'settings') {
        return 'transaction-notification bottom-space';
      }
      return 'transaction-notification bottom';
    },

    hideHeader() {
      if (this.$route.path === '/setup/0') {
        return true;
      }
      return false;
    },

    coinLogo() {
      if (this.walletType === 'celo' && this.coin.icon) {
        return `data:image/png;base64, ${this.coin.icon}`;
      }
      return this.coin.logo;
    },
    txsLength() {
      return this.$store.getters['entities/tx/all']().length;
    },
    txs() {
      return this.$store.getters['entities/tx/all']();
    },
  },

  watch: {
    $route() {
      console.log(`ROUTE ${window.history.length} - ${window.location}`);

      if (window.history.length > 0
          && this.$route.path !== '/setup/0'
          && this.$route.path !== '/setup/7'
          && this.$route.path !== '/'
          && this.$route.path !== '/wallet'
          && this.$route.name !== 'receiveCoin') {
        this.isBackButtonEnabled = true;
      } else {
        this.isBackButtonEnabled = false;
      }
    },
    // txsLength(newValue, oldValue) {
    //   if (this.enableTxNotification && (newValue > oldValue)) {
    //     const newTransactions = this.txs.slice(oldValue);
    //     this.showNotification(newTransactions);
    //   }
    // },
  },

  mounted() {
    this.$root.$on('enableTxNotifications', (value) => {
      this.enableTxNotification = value;
    });
  },

  methods: {
    goBack() {
      this.$router.go(-1);
    },

    setAccountModalOpened(value) {
      this.$store.dispatch('modals/setSelectAccountModalOpened', value);
    },

    openWalletsModal() {
      this.$store.dispatch('modals/setAddWalletModalOpened', true);
    },

    openChartModal() {
      this.$router.push({ path: `/wallet/single/prices/${this.wallet.id}` });
    },

    showNotification(txs) {
      const tx = txs.shift();
      if (!tx.sent) {
        const wallet = this.$store.getters['entities/wallet/find'](tx.wallet_id);
        const coin = Coin.query()
          .where('name', this.wallet.name)
          .where('contractAddress', this.wallet.contractAddress)
          .get()[0];
        const { logo } = coin;
        const maxValueLength = 6;
        this.newTxModalData = {
          logo,
          value: tx.value.toFixed(maxValueLength),
          symbol: wallet.symbol,
          id: tx.hash,
          wallet_id: tx.wallet_id,
        };
        this.showTxNotification = true;
        const wait = 10000;
        setTimeout(() => {
          this.showTxNotification = false;
          this.newTxModalData = null;
          if (txs.length > 0) {
            this.showNotification(txs);
          }
        }, wait);
      }
    },

    closeNotification() {
      this.showTxNotification = false;
      this.newTxModalData = null;
    },

    viewTx(id, walletId) {
      Object.keys(this.modals).forEach((modal) => {
        if (this.modals[modal] === true) {
          const capitalized = modal.charAt(0).toUpperCase() + modal.slice(1);
          this.$store.dispatch(`modals/set${capitalized}`, false);
        }
      });
      setTimeout(() => {
        const route = this.$route.name;
        if (route !== 'walletSingle') {
          this.$router.push({ path: `/wallet/single/${walletId}` });
        }
        setTimeout(() => {
          this.$store.dispatch('modals/setNewTxData', id);
          this.closeNotification();
        }, this.delay.short);
      }, this.delay.short);
    },
  },
};
</script>

<style>
.header-section {
  display: flex;
  justify-content: center;
  align-items: center;
  /* height: 2.5rem; */
  /* height: 2.5rem + constant(safe-area-inset-top);
  height: 2.5rem + env(safe-area-inset-top); */
  font-family: 'CooperHewitt-Semibold';
  position: relative;
  padding-top: 35px;

}

.main-header {
  /* height: 2.5rem; */
  /* height: 2.5rem + constant(safe-area-inset-top);
  height: 2.5rem + env(safe-area-inset-top); */
  font-family: 'CooperHewitt-Semibold';
  position: fixed;
  /* padding-top: 35px + constant(safe-area-inset-top);
  padding-top: 35px + env(safe-area-inset-top); */
  padding-top: 35px;
  z-index: 90;
  width: 100%;
}

body.q-ios-padding .main-header {
  padding-top: env(safe-area-inset-top);
}

.header-h1 {
  letter-spacing: normal;
  font-size: 1em;
  margin-top: 0.3em;
  position: relative;
}

.header-h1.logo {
  font-family: 'CooperHewitt-BoldItalic';
}

.header-logo {
  width: 4rem;
}

.header-back-button-wrapper {
  position: absolute;
  left: 0.5rem;
  height: 100%;
  display: flex;
  align-items: center;
}

.header-settings-button-wrapper,
.header-accounts-button-wrapper {
  position: absolute;
  right: 0.5rem;
  height: 100%;
  display: flex;
  align-items: center;
}

.header-accounts-button-wrapper {
  right: .8rem;
}

.icon-btn {
  margin: 0;
  padding-bottom: 0;
  min-height: auto;
  height: 100%;
  position: relative;
  width: 2em;
  padding: 0;
}

.back-arrow-btn .q-btn__content {
  justify-content: flex-start;
}

.icon-btn-right .q-btn__content {
  justify-content: flex-end;
}

.back-arrow-btn .q-focus-helper {
  display: none;
}

.coin-logo {
  height: 1.25rem;
  margin-right: 0.2rem;
  position: relative;
  top: 0.2em;
}

.hideBackButton {
  visibility: hidden;
}

.transaction-notification .q-dialog__inner{
  background: #eee;
  color: #1e3c57;
  bottom: 80px;
  justify-content: space-between;
  border-top: 1px solid #1e3c57;

}

.transaction-notification .label {
  padding-left: 1rem;
  padding: 1rem 0;
  line-height: 2.5;
  width: fit-content !important;
  font-size: inherit;
}

.transaction-notification .button-grp {
  padding:1rem 0;
  width: fit-content !important;
}

.bottom-space {
  z-index: 1999;
}

.bottom-space .q-dialog__inner {
  bottom: 80px;
}

.bottom {
  z-index: 9999;
}

.bottom .q-dialog__inner {
  bottom: 0;
}

.transaction-notification .coin-logo {
  margin: 1rem;
  margin-right: 0;
  height: 2rem;
  top: 0;
}

</style>
