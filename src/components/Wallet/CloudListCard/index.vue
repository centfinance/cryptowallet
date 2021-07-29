<template>
  <div class="cloud-list">
    <q-card
      v-if="currentWallet.length>0"
      class="my-card rounded-border-top"
      flat
      round
      bordered
    >
      <q-card-section>
        <div class="text-overline text-weight-bold text-orange-9">
          <q-avatar size="20px">
            <img :src="logo">
          </q-avatar> {{ display }} ({{ currentWallet.length }})
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
      <q-card-actions class="justify-start">
        <q-btn @click.prevent="connect">
          <q-avatar size="20px">
            <img src="~assets/wallet-connect.svg">
          </q-avatar>
        </q-btn>


        <q-btn
          icon="send"
          size="xs"
          color="grey"
          flat
          @click="openSelectCoinModal()"
        />
        <q-btn
          flat
          size="xs"
          icon="fas fa-plus-square"
          color="grey"
          @click="openSelectCoinModal(true)"
        />
        <q-btn
          flat
          color="grey"
          :label="getFormattedBalance()"
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
              v-for="w in currentWallet"
              :key="w.displayName"
              :wallet="w"
              :currency="selectedCurrency"
            />
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>
    <SelectCoinModal
      :wallets="selectCoinWallet"
      :buy="buy"
    />
    <WalletConnect
      :chain-id="chainId"
      :address="address"
    />
  </div>
</template>

<script>
// import Wallet from '@/store/wallet/entities/wallet';
import CloudListItem from '@/components/Wallet/CloudListItem';
import SelectCoinModal from '@/components/Modals/SelectCoin';
import WalletConnect from '@/components/WalletConnect/WalletConnect';
import {
  AmountFormatter,
  getBalance,
  // refreshWallet,
} from '@/helpers';

export default {
  name: 'CloudListCard',
  components: {
    CloudListItem,
    SelectCoinModal,
    WalletConnect,
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
      selectCoinWallet: null,
      buy: false,
      chainId: null,
    };
  },
  computed: {
    selectCoinModalOpened: {
      get() {
        return this.$store.state.modals.selectCoinModalOpened;
      },
      set(value) {
        this.$store.dispatch('modals/setSelectCoinModalOpened', value);
      },
    },
    currentChain() {
      return this.chainId;
    },
    currentWallet() {
      return this.wallet;
    },
    logo() {
      if (this.network.includes('Ethereum')) { // Ethereum Kovan
        return 'statics/icons/Ethereum.svg';
      }
      if (this.network.includes('XDai')) {
        return 'statics/icons/XDai.png';
      }
      return `statics/icons/${this.network}.svg`;
    },
    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },
  },
  methods: {
    getBalance() {
      let balance = 0;
      this.wallet.forEach((wallet) => {
        const { unconfirmed } = getBalance(wallet, this.authenticatedAccount);
        const price = this.$store.getters['entities/latestPrice/find'](`${this.network === 'Celo' ? 'celo' : wallet.identifier}_${this.selectedCurrency.code}`);
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
      console.log(`Opening: ${JSON.stringify(this.wallet)}`);
      this.selectCoinWallet = this.wallet;
      this.buy = buy;
      this.$store.dispatch('modals/setSelectCoinModalOpened', true);
    },
    connect() {
      // console.log(`Connect with: ${JSON.stringify(this.wallet)}`);
      console.log(`Connecting...${this.chainId}`);
      this.chainId = null;

      // eslint-disable-next-line no-magic-numbers
      this.chainId = this.getChainId(this.display); // 44787;
      this.address = this.wallet[0].externalAddress;
      // eslint-disable-next-line prefer-destructuring
      this.$store.dispatch('modals/setWalletConnectModalOpened', true);
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
