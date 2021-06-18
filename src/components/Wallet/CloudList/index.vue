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
      class="scroll-area extended cloud-scroll q-px-md q-pt-lg"
    >
      <!-- <div class="scroll-offset" /> -->
      <div v-if="!isCelo" class="row q-mb-sm justify-between text-h6 text-weight-bold">
        <div>
          {{ $t('assets') }}
          <!-- TODO: -->
          <!-- <span class="text-grey text-weight-thin">({{ wallets.length }})</span> -->
        </div>
        <div class="q-px-xs">
          <q-btn
            flat
            round
            size="sm"
            color="info"
            icon="add"
            class="bg-accent"
            @click.prevent="openWalletsModal"
          />
        </div>
      </div>
      <CloudListItem
        v-for="wallet in wallets"
        :key="wallet.id"
        :wallet="wallet"
        :currency="selectedCurrency"
      />
    </q-scroll-area>
  </div>
</template>

<script>
import CloudListItem from '@/components/Wallet/CloudListItem';
import { mapState } from 'vuex';
import Wallet from '@/store/wallet/entities/wallet';
import Coin from '@/store/wallet/entities/coin';

// const Web3 = require('web3');
// const ContractKit = require('@celo/contractkit');

export default {
  name: 'CloudList',
  components: {
    CloudListItem,
  },

  data() {
    return {
      scrollPosition: 0,
      interval: 15000,
      checkForUpdates: null,
    };
  },
  // Need to use contractKit
  computed: {
    ...mapState({
      // authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      selectedAccount: (state) => {
        return state.settings.selectedAccount;
      },
      walletType: (state) => { return state.settings.walletType; },
      modals: (state) => { return state.modals; },
    }),
    account() {
      return this.$store.getters['entities/account/find'](this.selectedAccount.id);
    },
    isCelo() {
      if (this.walletType === 'celo') { return true; }
      return false;
    },
    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },
    showTestnets() {
      return this.$store.getters['entities/account/find'](this.selectedAccount.id).showTestnets;
    },

    testnets() {
      const coins = Coin.query()
        .where('testnet', true).get();
      return coins.map(({ network }) => { return network; });
    },

    wallets() {
      const wallets = Wallet.query()
        .where('account_id', this.selectedAccount.id)
        .where('imported', true).get();
      if (!this.showTestnets) {
        return wallets.filter(({ network }) => {
          return !this.testnets.includes(network);
        });
      }
      // console.log(`Cloud LIST: ${JSON.stringify(wallets)}`);
      // if (this.account.walletType === 'celo') {
      //   wallets.forEach((element) => {
      //     // console.log(`Element: ${JSON.stringify(element.displayName)}`);
      //     // if (element.displayName === 'Celo Gold') { console.log('GOLD FOUND');
      //     // element.displayName = 'Celo'; element.symbol = 'CELO'; }
      //     if (element.symbol === 'cGLD') { element.displayName = ''; element.name = 'CELO'; }
      //   });
      // }
      return wallets;
    },
  },

  watch: {
    '$q.appVisible': function appVisible(val) {
      // console.log('App Visible');
      if (!val) {
        clearInterval(this.checkForUpdates);
      } else {
        this.updateInterval();
      }
    },
  },
  mounted() {
    // console.log('IAM-MOUNTED');
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
    openWalletsModal() {
      this.$store.dispatch('modals/setAddWalletModalOpened', true);
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
  },
};
</script>

<style>
.cloud-list .scroll-area {
  position: absolute;
  height: calc(100% - 19rem);
  width: 100%;
  left: 0;
  top: 15rem;
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
