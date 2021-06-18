<template>
  <q-layout
    :class="{
      'no-balance': !isBalanceVisible,
      'short-top': shortTop,
      'single-wallet-top': showCoinHeader,
    }"
    view="lHh Lpr lFf"
  >
    <Header />
    <!-- {{ walletType }} -->
    <div class="q-pull-to-refresh-wrapper">
      <q-pull-to-refresh
        :disable="!isPullEnabled || isPullTempDisabled"
        color="secondary"
        @refresh="refresher"
      >
        <div class="background" />
        <div
          v-if="wallets.length > 0 && !showCoinHeader && walletType !== 'celo'"
          class="total-balance-wrapper"
        >
          <div
            v-if="showTotalBalance"
            class="total-balance flex flex-center column"
          >
            <div class="row">
              {{ totalBalanceFormatted }}
            </div>
            <div
              v-if="walletType === 'celo' "
              class="row text-h6"
            >
              {{ totalBalanceInEth }} CELO
            </div>
            <div
              v-else
              class="row text-h6"
            >
              {{ totalBalanceInEth }} ETH
            </div>
          </div>
        </div>
        <div
          v-if="walletType==='celo' && !showCoinHeader"
          class="total-balance-wrapper"
        >
          <div class="container splash">
            <div class="splash-logo text-center absolute-top">
              <img
                class="logo-loading"
                src="~/assets/cent-logo-white.svg"
              >
              <!-- <img
                v-else
                class="logo-loading"
                src="~/assets/cent-logo-black.svg"
              > -->
              <p class="splash-slogan">
                {{ $t('splashSlogan') }}
              </p>
            </div>
          </div>
        </div>
      </q-pull-to-refresh>
      <q-pull-to-refresh
        :disable="!isSinglePullEnabled || isSinglePullTempDisabled || singlePullDisabled"
        color="secondary"
        @refresh="refresher"
      >
        <div
          class="layout-wrapper"
          @touchmove="prevent"
        >
          <div
            v-if="showCoinHeader"
            class="coin-header-wrapper"
          >
            <CoinHeader
              :wallet="wallet"
              :simple="true"
            />
          </div>


          <div
            :class="{ white: layoutShapeWhite }"
            class="layout-shape"
          >
            <keep-alive>
              <router-view />
            </keep-alive>
          </div>
        </div>
      </q-pull-to-refresh>
    </div>

    <transition
      enter-active-class="animated slideInUp"
      leave-active-class="animated slideOutDown"
    >
      <q-footer>
        <MainNav />
      </q-footer>
    </transition>
  </q-layout>
</template>

<script>
import { mapState } from 'vuex';
import Wallet from '@/store/wallet/entities/wallet';
import Coin from '@/store/wallet/entities/coin';
import MainNav from '@/layouts/MainNav';
import Header from '@/layouts/Header';
import CoinHeader from '@/components/Wallet/CoinHeader';
import {
  AmountFormatter,
  getBalance,
  refreshWallet,
} from '@/helpers';


export default {
  name: 'AuthedLayout',
  components: {
    MainNav,
    Header,
    CoinHeader,
  },

  data() {
    return {
      isPullEnabled: true,
      isPullTempDisabled: false,
      isSinglePullEnabled: true,
      isSinglePullTempDisabled: false,
      transitionName: 'slide-left',
      isBalanceVisible: true,
      worker: null,
    };
  },

  computed: {
    ...mapState({
      id: (state) => { return state.route.params.id; },
      walletType: (state) => { return state.settings.walletType; },
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      selectedAccount: (state) => { return state.settings.selectedAccount; },
      delay: (state) => { return state.settings.delay; },
      singlePullDisabled: (state) => { return state.settings.disablePullToRefresh; },
    }),

    wallets() {
      const wallets = Wallet.query()
        .where('account_id', this.selectedAccount.id)
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
      return this.$store.getters['entities/account/find'](this.selectedAccount.id);
    },
    // walletType() {
    //   if (this.account) {
    //     return this.account.walletType;
    //   }
    //   return null;
    // },
    demoMode() {
      if (this.account) {
        return this.account.demoMode;
      }
      return null;
    },
    showTestnets() {
      if (this.account) {
        return this.account.showTestnets;
      }
      return null;
    },
    testnets() {
      const coins = Coin.query()
        .where('testnet', true).get();
      return coins.map(({ network }) => { return network; });
    },
    wallet() {
      if (this.id) {
        return this.$store.getters['entities/wallet/find'](this.id);
      }
      return null;
    },

    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },

    ethPrice() {
      const prices = this.$store.getters['entities/latestPrice/find'](`ethereum_${this.selectedCurrency.code}`);
      if (!prices) {
        return null;
      }
      return prices.data.PRICE;
    },

    totalBalance() {
      let balance = 0;
      this.wallets.forEach((wallet) => {
        if (wallet.sdk === 'Celo') {
          const { unconfirmed } = getBalance(wallet, this.selectedAccount.id);
          // eslint-disable-next-line no-console
          // console.log(`Total Balance: ${unconfirmed} - ${available}`);
          // eslint-disable-next-line no-console
          // console.log(` WALLET: ${wallet.name}`);
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
            if (wallet.name === 'Celo' || wallet.name === 'Eth') {
              // console.log(`in Celo ${JSON.stringify(formattedAmount)}`);
              balance += parseFloat(formattedAmount.getFormatted());
            }

            // console.log(`balance+= ${balance}`);
          }
        }
      });

      return balance;
    },

    totalBalanceFormatted() {
      const formattedBalance = new AmountFormatter({
        amount: this.totalBalance,
        format: '0,0[.]00',
        currency: this.selectedCurrency,
        toCurrency: false,
        toCoin: false,
        withCurrencySymbol: true,
      });

      return formattedBalance.getFormatted();
    },
    totalBalanceInEth() {
      const formattedAmount = new AmountFormatter({
        amount: this.totalBalance,
        rate: this.ethPrice,
        format: '0.00000000',
        coin: 'Ethereum',
        prependPlusOrMinus: false,
        currency: this.selectedCurrency,
        toCoin: true,
      });
      return parseFloat(formattedAmount.getFormatted());
    },
    showTotalBalance() {
      return this.$route.name === 'wallet'
             || this.$route.name === 'sendCoin'
             || this.$route.name === 'receiveCoin'
             || this.$route.name === 'coinHistory'
             || this.$route.name === 'coinPrices';
    },
    layoutShapeWhite() {
      return this.$route.name === 'settings'
             || this.$route.name === 'exchange'
             || this.$route.name === 'walletSingle'
             || this.$route.name === 'sendCoinSingle'
             || this.$route.name === 'receiveCoinSingle'
             || this.$route.name === 'addFundsSingle'
             || this.$route.name === 'walletconnect'
             || this.$route.name === 'coinSinglePrices';
    },
    shortTop() {
      return this.$route.name === 'settings'
             || this.$route.name === 'walletconnect'
             || this.$route.name === 'exchange';
    },
    showCoinHeader() {
      return (this.$route.name === 'walletSingle' && this.wallet)
             || (this.$route.name === 'sendCoinSingle' && this.wallet)
             || (this.$route.name === 'receiveCoinSingle' && this.wallet)
             || (this.$route.name === 'coinSinglePrices' && this.wallet);
    },
  },

  watch: {
    /**
     * Watch the $route to keep the MainNav visibility updated
     */
    '$route.path': {
      handler() {
        this.updateisPullEnabled();
      },
    },
  },

  /**
   * Make sure that the MainNav visibility is set correctly on initial render
   */
  beforeMount() {
    this.updateisPullEnabled();
  },

  mounted() {
    this.$root.$on('isHomeBalanceVisible', (value) => {
      this.isBalanceVisible = value;
    });
    if (this.account) {
      this.$q.dark.set(this.account.darkMode);
    }
  },

  methods: {
    prevent() {
      return false;
    },

    addFunds() {
      this.$router.push({ path: '/wallet/add-funds/' });
    },

    updateisPullEnabled() {
      this.isPullEnabled = (this.$route.name === 'wallet' && this.wallets.length > 0);
      this.isSinglePullEnabled = this.$route.name === 'walletSingle';
    },

    refresher(done) {
      const online = window ? window.navigator.onLine : navigator.connection === 'none';
      if (online) {
        if (this.$route.name === 'wallet') {
          setTimeout(async () => {
            try {
              await this.updateBalances(done);
              await this.backEndService.loadPriceFeed();
              done();
            } catch (err) {
              this.errorHandler(err);
              done();
            }
          }, this.delay.normal);
        } else {
          setTimeout(() => {
            this.$root.$emit('updateWalletSingle', done);
          }, this.delay.normal);
        }
      } else { done(); }
    },

    async updateBalances(done) {
      try {
        const coins = this.wallets
          .filter((wallet) => {
            return !wallet.erc20Wallet;
          });
        // console.log(`UPDATE BALANCE ${JSON.stringify(coins)}`);
        const coinPromises = coins.map((wallet) => {
          return refreshWallet(wallet, false);
        });
        await Promise.all(coinPromises);
        // console.log('WALLET REFRESHED');
        // console.log(`wallet ===> ${JSON.stringify(this.wallet)} - ${this.selectedAccount.id}`);
        const tokenPromises = coins.map((wallet) => {
          return Coin.fetchAllTokens(
            wallet.externalAddress, this.selectedAccount.id, wallet.network,
          );
        });
        await Promise.all(tokenPromises);
      } catch (err) {
        this.errorHandler(err);
        done();
      }
    },
  },
};
</script>

<style>
.animated {
  animation-duration: 150ms;
}

.total-balance {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'CooperHewitt-BoldItalic';
  font-size: 2.5rem;
  line-height: 1;
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
  height: 100%;
}

.total-balance > div {
  margin-top: 0.2em;
}

.total-balance button {
  box-shadow: 0px 10px 10px rgba(0,0,0,0.1);
}

.total-balance-wrapper {
  transition: all ease-in-out 150ms;
  position: relative;
  top: 0;
  display: block!important;
  height: 15rem!important;
  position: absolute;
  width: 100%;
  opacity: 1;
  padding: 0 0.5rem;
  margin-top: calc(2.5rem + 35px);
  z-index: 3;
}

.no-balance .total-balance-wrapper,
.short-top .total-balance-wrapper {
  top: -5rem;
  height: 0rem!important;
  opacity: 0;
}

.no-balance .scroll-area.extended {
  height: calc(100%);
}

.pull-to-refresh-message {
  transition: all ease-in-out 150ms;
  top: 0;
}

/*.no-balance .pull-to-refresh-message {
  top: -5rem!important;
}*/

.layout-shape .layout {
  height: calc(100vh - 4rem - constant(safe-area-inset-bottom))!important;
  height: calc(100vh - 4rem - env(safe-area-inset-bottom))!important;
  height: calc(100vh - 4rem)!important;
}

.layout-shape.white {
  background: white!important;
  box-shadow: 0px 10px 20px rgba(0,0,0,0.1);
  margin-top: 10px;
}
body.body--dark .layout-shape.white {
 background: black!important;
}


.no-balance .layout-shape {
  background: #e4e9ef;
}

.background {
  transition: all ease-in-out 150ms;
}

.no-balance .background,
.short-top .background {
  height: 17rem;
}

.single-wallet-top .background {
  height: 17.5rem;
}

/*.q-pull-to-refresh-wrapper {
  padding-top: 2.5rem;
}*/

.q-pull-to-refresh-wrapper .pull-to-refresh-message {
  position: relative;
  z-index: 2
}

.coin-header-wrapper {
  height: 8rem!important;
  padding: 1rem 0.5rem;
}

.single-wallet-top .coin-header-wrapper {
  height: 18rem!important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 0rem;
}

</style>
