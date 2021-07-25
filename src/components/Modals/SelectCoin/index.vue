<template>
  <div>
    <q-dialog
      v-model="selectCoinModalOpened"
      transition-show="slide-up"
      transition-hide="slide-down"
      content-class="dark-modal"
    >
      <q-card
        class="full-width"
        style="height: 60%; width:100%"
      >
        <div class="header-section">
          <div class="header-back-button-wrapper">
            <q-btn
              icon="arrow_back"
              size="lg"
              class="icon-btn back-arrow-btn"
              flat
              @click.prevent="closeModal"
            />
          </div>
          <div
            style="color:grey"
            class="grey justify-between text-h6 text-weight-bold"
          >
            Select Wallet
          </div>
        </div>

        <q-card-section>
          <q-list
            v-for="wallet in wallets"
            :key="wallet.displayName"
            :wallet="wallet"
          >
            <q-card-section class="text-subitle2">
              <CoinHeader
                :quick="true"
                :buy="buy"
                :wallet="wallet"
              />
            </q-card-section>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
// import AddErc20Content from './AddErc20Content';
import CoinHeader from '@/components/Wallet/CoinHeader';
import Wallet from '@/store/wallet/entities/wallet';

export default {
  name: 'SelectCoinModal',
  components: {
    CoinHeader,
  },
  props: {
    wallets: {
      type: Array(Wallet),
    },
    buy: {
      type: Boolean,
    },
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
  },
  methods: {
    goToWallet() {
      console.log('Here');
      this.$router.push({ path: `/wallet/single/${this.wallet.id}` });
    },
    closeModal() {
      // this.refreshPrices();
      this.selectCoinModalOpened = false;
    },
  },
};
</script>

<style>
</style>
