<template>
  <div
    class="main"
    :class="{ shrinked : settings.layout !== 'dark' }"
  >
    <q-btn
      color="purple"
      text-color="black"
      label="Standard"
      @click="hydrateData()"
    />
    <LoadingScreen
      v-if="showMe"
      :show="settings.loading"
    />

    <div
      id="q-app"
      :class="{ hidden: scanning }"
    >
      <router-view />
      <SelectAccountModal />
      <NewAccountModal />
      <GetStartedModal />
      <TermsModal />
      <RootedNoticeModal />

      <div v-if="settings.authenticatedAccount">
        <OfflineNotice />
        <WalletsModal />
        <PriceChartModal />
        <SendCoinModal />
        <ReceiveCoinModal />
        <ConfirmSendModal />
        <SendSuccessModal />
        <SendFailureModal />
        <AddErc20Modal />
        <AddFundsModal />
      </div>
    </div>
    <Scanner v-if="scanning" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { hydrateStore } from '@/store';
import LoadingScreen from '@/components/LoadingScreen';
import Coin from '@/store/wallet/entities/coin';

import Scanner from '@/components/Scanner';
import WalletsModal from '@/components/Modals/Wallets';
import PriceChartModal from '@/components/Modals/PriceCharts';
import SelectAccountModal from '@/components/Modals/SelectAccount';
import NewAccountModal from '@/components/Modals/NewAccount';
import GetStartedModal from '@/components/Modals/GetStarted';
import TermsModal from '@/components/Modals/Terms';
import SendCoinModal from '@/components/Modals/SendCoin';
import ReceiveCoinModal from '@/components/Modals/ReceiveCoin';
import ConfirmSendModal from '@/components/Modals/ConfirmSend';
import SendSuccessModal from '@/components/Modals/SendSuccess';
import SendFailureModal from '@/components/Modals/SendFailure';
import AddErc20Modal from '@/components/Modals/AddErc20';
import OfflineNotice from '@/components/OfflineNotice';
import AddFundsModal from '@/components/Modals/AddFunds';
import RootedNoticeModal from '@/components/Modals/RootedNotice';
// import TorusSDK from '@/helpers/DirectAuth';

export default {
  name: 'App',
  components: {
    LoadingScreen,
    Scanner,
    WalletsModal,
    PriceChartModal,
    SelectAccountModal,
    NewAccountModal,
    GetStartedModal,
    TermsModal,
    SendCoinModal,
    ReceiveCoinModal,
    ConfirmSendModal,
    SendSuccessModal,
    SendFailureModal,
    AddErc20Modal,
    OfflineNotice,
    AddFundsModal,
    RootedNoticeModal,
  },

  data() {
    return {
      hidden: false,
      qrOrigin: '',
      showMe: false,
    };
  },

  computed: {
    ...mapState({
      settings: (state) => { return state.settings; },
      scanning: (state) => { return state.qrcode.scanning; },
      qrMode: (state) => { return state.qrcode.qrMode; },
    }),
    accounts() {
      return this.$store.getters['entities/account/query']().get();
    },
    account() {
      return this.accounts.find((account) => {
        return account.name === this.settings.selectedAccount;
      });
    },
    supportedCoins() {
      return this.$store.state.settings.supportedCoins;
    },
  },

  watch: {
    account: {
      handler() {
        if (this.account.darkMode) { this.$q.dark.set(this.account.darkMode); }
      },
    },


    /**
     * Waits until hydration is completed,
     * If there are no Accounts, got to setup
     */

    'settings.loading': {
      async handler() {
        if (this.accounts.length < 1) {
          this.$router.push({ path: '/setup/0' });
        }
        await Coin.fetchIcons();
        this.storeSupportedCoins();
        return true;
      },
    },
    scanning: {
      handler(newValue, oldValue) {
        if (oldValue === false && newValue === true) {
          this.$q.scanning = true;
          if (typeof QRScanner !== 'undefined') {
            QRScanner.show(() => {});
          }
        }

        if (oldValue === true && newValue === false) {
          if (this.qrMode === 'addERC20') {
            this.$store.dispatch('modals/setAddWalletModalOpened', true);
            this.$store.dispatch('modals/setAddErc20ModalOpened', true);
            this.$store.dispatch('qrcode/setQRMode', null);
          } else if (this.qrMode === 'restore') {
            this.$store.dispatch('qrcode/setQRMode', null);
          } else {
            this.$store.dispatch('modals/setSendCoinModalOpened', true);
          }
          this.codeReader.reset();
          this.$q.scanning = false;
          if (typeof QRScanner !== 'undefined') {
            QRScanner.hide(() => {});
            QRScanner.destroy(() => {});
          }
        }
      },
    },
  },

  mounted() {
    // this.hydrateData();
    // window.store = this.$store;
    // window.app = this;
    // hydrateStore();
    // if (window.cordova) {
    //   StatusBar.overlaysWebView(true);
    //   StatusBar.styleDefault();
    //   const rooted = () => { this.$store.dispatch('modals/setRootedNoticeModalOpened', true); };
    //   IRoot.isRooted(() => {}, rooted);
    //   IRoot.isRootedWithBusyBox(() => {}, rooted);
    //   window.plugins.preventscreenshot.enable(() => {}, () => {});
    // }
    // if (!this.settings.authenticatedAccount) { this.$router.push({ path: '/' }); }
  },

  methods: {
    hydrateData() {
      // eslint-disable-next-line no-console
      console.log('button clicked');
      window.store = this.$store;
      window.app = this;
      hydrateStore();
      if (window.cordova) {
        StatusBar.overlaysWebView(true);
        StatusBar.styleDefault();
        const rooted = () => { this.$store.dispatch('modals/setRootedNoticeModalOpened', true); };
        IRoot.isRooted(() => {}, rooted);
        IRoot.isRootedWithBusyBox(() => {}, rooted);
        window.plugins.preventscreenshot.enable(() => {}, () => {});
      }
      if (!this.settings.authenticatedAccount) { this.$router.push({ path: '/' }); }
    },
    storeSupportedCoins() {
      this.supportedCoins.forEach((coin) => {
        const isThere = Coin.findToken(coin.name);
        const data = {
          name: coin.name,
          displayName: coin.displayName,
          sdk: coin.sdk,
          symbol: coin.symbol,
          network: coin.network,
          denomination: coin.denomination,
          minConfirmations: coin.minConfirmations,
          decimals: coin.decimals,
          api: coin.api,
          testnet: coin.testnet ? coin.testnet : false,
          transak: coin.transak ? coin.transak : false,
          identifier: coin.identifier || '',
        };
        if (!isThere) {
          if (coin.sdk === 'ERC20') {
            data.parentName = coin.parentName;
            data.parentSdk = coin.parentSdk;
            data.contractAddress = coin.contractAddress;
          }
          Coin.$insert({
            data: coin,
          });
        } else {
          Coin.$update({
            where: isThere.id,
            data,
          });
        }
      });
      // const coins = Coin.all().map(({ name }) => { return name; });
      // const supported = this.supportedCoins.map(({ name }) => { return name; });
      // const oldCoins = coins.filter((c) => {
      //   return supported.indexOf(c) < 0;
      // });
      // oldCoins.forEach((old) => {
      //   Coin.$delete(old);
      // });

      // console.log(oldCoins);
    },
  },
};
</script>

<style lang='styl'>
/* body > div {
  color: black;
} */

body.desktop #q-app {
  max-width: 600px;
}

body.desktop .main {
    justify-content: center;
    display: flex;
    flex-wrap: wrap;
}

body.desktop .background {
    max-width: 600px;
}

.background {
  height: 100%;
  width: 100%;
  position: absolute;
}

.shrinked .background {
  background: rgb(49,255,216);
  background: linear-gradient(332deg, rgba(49,255,216,1) 0%, rgba(221,61,255,1) 100%);  width: 100%;
  height: calc(17.5rem + 35px);
  }

.new-wallet-btn-wrapper {
  padding: 1rem;
  display: flex;
  justify-content: center;
  box-shadow: 0px 0px 11px 0px rgba(0, 0, 0, 0.5);
  background: #2c5070;
  position: relative;
}

.close-button-wrapper {
  padding: 0.5rem;
  height: 2.7rem;
}

.light-modal .modal-content {
    background: whitesmoke;
    color: black;
}

.q-dialog .modal-layout-wrapper {
  height: calc(100vh - 2.5rem - 35px )!important;
  /* height: calc(100vh - 2.5rem - constant(safe-area-inset-bottom)
   - constant(safe-area-inset-top))!important; */
}

body.desktop .q-dialog .modal-layout-wrapper::-webkit-scrollbar {
  display: none;
}


body.q-ios-padding .q-dialog .modal-layout-wrapper {
  height: calc(100vh - 2.5rem - env(safe-area-inset-bottom) - env(safe-area-inset-top))!important;
}

.dark-modal .q-dialog__inner--maximized {
  background: whitesmoke;
}

.light-modal .q-dialog__inner--maximized {
  background: whitesmoke;

}

body.body--dark .q-dialog__inner--maximized {
  background: $dark;
}

/* .light-modal .header-section {
  background: whitesmoke;
}

.dark-modal .header-section {
  color: black;
  background: whitesmoke;
} */

.dark-modal .header-section i {
  color: var(--q-color-primary);
}

/* .dark-modal .modal-layout-wrapper {
    color: black;
    background-color: whitesmoke;
}

.light-modal .modal-layout-wrapper {
  background: white;
  background: whitesmoke;

} */


.modal-layout-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 2.5rem);
  /* height: calc(100vh - 2.5rem - constant(safe-area-inset-top));
  height: calc(100vh - 2.5rem - env(safe-area-inset-top)); */
  position: relative;
  padding: 0.5rem;
  overflow: scroll;
}

.modal-layout-wrapper.full {
  height: 100vh!important;
}

.modal-layout-wrapper.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-layout-wrapper.no-padding {
  padding: 0;
}

.modal-layout-wrapper.centered {
  display: flex;
  align-items: center;
  justify-content: center;
}

.light-modal .modal-layout-wrapper {
  color: slategray;
}

.body--dark .light-modal .modal-layout-wrapper {
  color: white;
}

/* .dark-modal .modal-layout-wrapper {
  color: black;
} */

.modal {
  font-family: Inter-Regular;
}

.developed-by {
  text-align: center;
  width: 50%;
}

.developed-by {
    font-size: 0.7rem;
    text-transform: uppercase;
    font-family: CooperHewitt-Semibold;
    opacity: 0;
}

</style>
