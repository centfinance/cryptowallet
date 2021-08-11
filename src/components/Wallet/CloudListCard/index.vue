<template>
  <div class="cloud-list">
    <q-card
      v-if="wallet.length>0"
      class="my-card q-mb-sm rounded-border-top"
      flat
      round
      bordered
    >
      <q-card-section class="q-pa-sm">
        <div class="text-overline text-weight-bold text-orange-9">
          <q-avatar size="20px">
            <img
              v-if="network.includes('Ethereum')"
              src="~/assets/ethereum.svg"
            >
            <img
              v-if="network.includes('XDai')"
              src="~/assets/xdai.png"
            >
            <img
              v-if="network.includes('Celo')"
              src="~/assets/celo.svg"
            >
          </q-avatar> {{ display }} ({{ wallet.length }})
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
            @click="copyToClipboard(address)"
          />
        </div>
      </q-card-section>
      <q-card-actions class="justify-start q-pa-xs">
        <q-btn @click.prevent="connect">
          <q-avatar size="20px">
            <img src="~assets/wallet-connect.svg">
          </q-avatar>
        </q-btn>


        <q-btn
          icon="send"
          size="sm"
          color="grey"
          flat
          @click="openSelectCoinModal(false)"
        />
        <q-btn
          flat
          size="sm"
          icon="fas fa-plus-square"
          color="grey"
          @click="openSelectCoinModal(true)"
        />

        <q-btn
          v-if="displayPriceChart"
          icon="stacked_bar_chart"
          color="primary"
          size="sm"
          class="icon-btn icon-btn-right"
          flat
          @click.prevent="openChartModal"
        />

        <q-btn
          flat
          color="grey"
          :label="getFormattedBalance()"
        />

        <q-btn
          color="grey"
          round
          size="sm"
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
              v-for="w in wallet"
              :key="w.id"
              :wallet="w"
              :currency="selectedCurrency"
            />
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>
    <SelectCoinModal
      :key-id="display"
      :select-coin-wallets="wallet"
      :buy="buy"
    />
  </div>
</template>

<script>
import CloudListItem from '@/components/Wallet/CloudListItem';
import SelectCoinModal from '@/components/Modals/SelectCoin';

import {
  AmountFormatter,
  getBalance,
} from '@/helpers';

export default {
  name: 'CloudListCard',
  components: {
    CloudListItem,
    SelectCoinModal,
  },
  props: {
    wallet: {
      type: Array,
    },
    network: {
      type: String,
    },
    address: {
      type: String,
    },
    display: {
      type: String,
    },
  },
  data() {
    return {
      visible: false,
      buy: false,
      chainId: null,
      walletConnectedId: null,
      chartWallets: ['ETH', 'XDAI', 'CELO'],
      chartWalletId: null,
    };
  },
  computed: {
    currentChain() {
      return this.chainId;
    },
    logo() {
      if (this.network.includes('Ethereum')) { // Ethereum Kovan
        return '~/assets/ethereum.svg';
      }
      if (this.network.includes('XDai')) {
        return '~/assets/xdai.png';
      }
      return '~assets/celo.svg';
    },
    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },
    displayPriceChart() {
      const cw = this.wallet.filter((c) => {
        return this.chartWallets.includes(c.symbol);
      });
      if (cw.length > 0 && this.selectedCurrency) {
        const w = cw[0].network.toLowerCase() === 'xdai' ? 'dai' : cw[0].network.toLowerCase();
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.chartWalletId = cw[0].id;
        const price = this.$store.getters['entities/latestPrice/find'](`${w}_${this.selectedCurrency.code}`);
        if (price) {
          return true;
        }
      }
      return false;
    },
  },
  mounted() {
    this.$root.$on('walletConnected', (args) => {
      this.walletConnectedId = args.walletConnectedId;
    });
  },
  methods: {
    openChartModal() {
      this.$router.push({ path: `/wallet/single/prices/${this.chartWalletId}` });
    },
    getBalance() {
      let balance = 0;
      this.wallet.forEach((wallet) => {
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

          balance += parseFloat(formattedAmount.getFormatted());
        }
      });
      this.$emit('cardBalanace', { network: this.display, balance });
      return balance;
    },
    getFormattedBalance() {
      const bal = this.getBalance();

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
    toggleVisibility() {
      this.visible = !this.visible;
    },
    openSelectCoinModal(buy = false) {
      this.buy = buy;
      this.selectCoinWallet = this.wallet;
      this.$store.dispatch('modals/setSelectCoinModalOpened', { open: true, selectedKey: this.display });
    },
    connect() {
      this.chainId = null;
      // eslint-disable-next-line no-magic-numbers
      this.chainId = this.getChainId(this.display);
      this.address = this.wallet[0].externalAddress;
      // eslint-disable-next-line prefer-destructuring
      this.$store.dispatch('modals/setWalletConnectModalOpened', { open: true, chainId: this.chainId, address: this.address });
    },
    getChainId(val) {
      switch (val) {
        case 'Celo ALFAJORE':
          // eslint-disable-next-line no-magic-numbers
          return 44787;
        case 'Celo':
          // eslint-disable-next-line no-magic-numbers
          return 42220;
        default:
          return this.wallet[0].hdWallet.network.chainId;
      }
    },
    closeModal() {
      // this.refreshPrices();
      this.selectCoinModalOpened = false;
    },
    copyToClipboard(val) {
      try {
        if (window.cordova) {
          cordova.plugins.clipboard.copy(val);
        } else {
          this.$clipboard(val);
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
