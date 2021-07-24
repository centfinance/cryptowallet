<template>
  <div class="cloud-list">
    <div v-if="walletsETH.length === 0">
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
      v-if="walletsETH.length > 0"
      ref="scrollArea"
      class="scroll-area extended cloud-scroll q-px-md q-pt-lg"
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
          My Wallet Balance
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
      <q-card
        class="my-card rounded-border-top"
        flat
        round
        bordered
      >
        <q-card-section>
          <div class="text-overline text-weight-bold text-orange-9">
            <q-avatar size="20px">
              <img src="~assets/icons/eth.svg">
            </q-avatar> Ethereum ({{ walletsETH.length }})
          </div>
          <!-- <div class="text-h6 q-mt-sm q-mb-xs">
            Address
          </div> -->
          <div
            textMiddleEllipsis="4"
            class="text-caption text-grey"
          >
            {{ address.substring(0,5) }} ... {{ address.substring(address.length - 5) }}
            <q-icon
              name="content_copy"
              class="cursor-pointer"
              @click="copyToClipboard"
            />
          </div>
        </q-card-section>
        <q-card-actions class="justify-start">
          <q-btn @click.prevent="connectETH">
            <q-avatar size="20px">
              <img src="~assets/wallet-connect.svg">
            </q-avatar>
            <!-- <q-badge
              color="orange"
              floating
              class="xs"
            /> -->
          </q-btn>


          <q-btn
            icon="send"
            size="xs"
            color="grey"
            flat
            @click="openSelectCoinModal(walletsETH)"
          />
          <q-btn
            flat
            size="xs"
            icon="fas fa-plus-square"
            color="grey"
            @click="openSelectCoinModal(walletsETH,true)"
          />
          <q-btn
            flat
            color="grey"
            :label="getFormattedBalance(ETHBalance)"
          />

          <q-btn
            color="grey"
            round
            size="xs"
            flat
            dense
            :icon="visible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            @click="toggleVisibility"
          />
        </q-card-actions>

        <q-slide-transition>
          <div v-show="visible">
            <hr style="border-top:1px grey">
            <q-card-section class="text-subitle2">
              <CloudListItem
                v-for="wallet in walletsETH"
                :key="wallet.displayName"
                :wallet="wallet"
                :currency="selectedCurrency"
              />
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
      <br>
      <!-- XDAI -->
      <q-card
        v-if="!demoMode"
        class="rounded-border-top"
        flat
        bordered
      >
        <q-card-section>
          <div class="text-overline text-weight-bold text-orange-9">
            <q-avatar size="20px">
              <img src="~assets/icons/xdai.png">
            </q-avatar> XDAI ({{ walletsXDAI.length }})
          </div>
          <!-- <div class="text-h5 q-mt-sm q-mb-xs">
            Address
          </div> -->
          <div class="text-caption text-grey">
            {{ address.substring(0,5) }} ... {{ address.substring(address.length - 5) }}
            <q-icon
              name="content_copy"
              class="cursor-pointer"
              @click="copyToClipboard"
            />
          </div>
        </q-card-section>
        <q-card-actions class="justify-left">
          <!-- <q-btn
            flat
            icon="share"
            color="grey"
          /> -->

          <q-btn @click.prevent="connectXDAI">
            <q-avatar size="20px">
              <img src="~assets/wallet-connect.svg">
            </q-avatar>
            <!-- <q-badge
              color="orange"
              floating
              class="xs"
            /> -->
          </q-btn>


          <q-btn
            icon="send"
            size="xs"
            color="grey"
            flat
            @click="openSelectCoinModal(walletsXDAI)"
          />
          <q-btn
            flat
            size="xs"
            icon="fas fa-plus-square"
            color="grey"
            @click="openSelectCoinModal(walletsXDAI,true)"
          />
          <q-btn
            flat
            color="grey"
            :label="getFormattedBalance(XDAIBalance)"
          />

          <q-btn
            color="grey"
            round
            size="xs"
            flat
            dense
            :icon="visible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            @click="togglexDaiVisibility"
          />
        </q-card-actions>
        <q-slide-transition>
          <div v-show="xDaivisible">
            <q-separator />
            <q-card-section class="text-subitle2">
              <CloudListItem
                v-for="wallet in walletsXDAI"
                :key="wallet.displayName"
                :wallet="wallet"
                :currency="selectedCurrency"
              />
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
    </q-scroll-area>
    <WalletConnect
      :chain-id="chainId"
      :address="address"
    />
    <SelectCoinModal
      :wallets="selectCoinWallet"
      :buy="buy"
    />
  </div>
</template>

<script>
import CloudListItem from '@/components/Wallet/CloudListItem';
import SelectCoinModal from '@/components/Modals/SelectCoin';
import WalletConnect from '@/components/WalletConnect/WalletConnect';
import { mapState } from 'vuex';

import Wallet from '@/store/wallet/entities/wallet';
import Coin from '@/store/wallet/entities/coin';

import {
  AmountFormatter,
  getBalance,
  // refreshWallet,
} from '@/helpers';

export default {
  name: 'CloudList',
  components: {
    CloudListItem,
    WalletConnect,
    SelectCoinModal,

  },

  data() {
    return {
      scrollPosition: 0,
      interval: 15000,
      visible: false,
      xDaivisible: false,
      address: '',
      totalAssets: 0,
      checkForUpdates: null,
      connectWalletXDAI: false,
      chainId: null,
      XDAIBalance: null,
      ETHBalance: null,
      selectCoinWallet: null,
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
        .where('imported', true)
        .get();

      if (!this.showTestnets) {
        return wallets.filter(({ network }) => {
          return !this.testnets.includes(network);
        });
      }
      return wallets;
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
    demoMode() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount).demoMode;
    },
    testnets() {
      const coins = Coin.query()
        .where('testnet', true).get();
      return coins.map(({ network }) => { return network; });
    },
    walletsETH() {
      const xwallet = this.fetchWallet(this.demoMode ? 'ETHEREUM_RINKEBY' : 'ETHEREUM');
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.ETHBalance = this.getBalance(xwallet);
      return xwallet;
    },
    walletsXDAI() {
      const xwallet = this.fetchWallet('XDAI');
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.XDAIBalance = this.getBalance(xwallet);
      return xwallet;
    },
    totalBalance() {
      return this.ETHBalance + this.XDAIBalance;
    },

    totalBalanceFormatted() {
      return this.getFormattedBalance(this.totalBalance);
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
    connectXDAI() {
      this.chainId = this.walletsXDAI[0].hdWallet.network.chainId;
      this.address = this.walletsXDAI[0].externalAddress;
      // eslint-disable-next-line prefer-destructuring
      this.$store.dispatch('modals/setWalletConnectModalOpened', true);
    },
    connectETH() {
      this.chainId = this.walletsETH[0].hdWallet.network.chainId;
      this.address = this.walletsETH[0].externalAddress;
      // eslint-disable-next-line prefer-destructuring
      this.$store.dispatch('modals/setWalletConnectModalOpened', true);
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
      if (this.address === '') {
        this.address = wallets[0].externalAddress;
      }
      return wallets;
    },

    toggleVisibility() {
      this.visible = !this.visible;
    },
    togglexDaiVisibility() {
      this.xDaivisible = !this.xDaivisible;
    },
    openWalletsModal() {
      this.$store.dispatch('modals/setAddWalletModalOpened', true);
    },

    openSelectCoinModal(wallet, buy = false) {
      this.selectCoinWallet = wallet;
      this.buy = buy;
      this.$store.dispatch('modals/setSelectCoinModalOpened', true);
    },
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

    copyToClipboard() {
      try {
        if (window.cordova) {
          cordova.plugins.clipboard.copy(this.address);
        } else {
          this.$clipboard(this.address);
        }
        this.$q.notify({
          message: this.$t('copied'),
          color: 'positive',
          timeout: '1500',
          classes: 'text-center',
        });
      } catch (err) {
        this.errorHandler(err);
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
