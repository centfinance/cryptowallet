<template>
  <div
    @click="goToWallet"
  >
    <div class="q-mb-lg q-pa-md bg-white cloud-item">
      <CoinHeader :wallet="wallet" />
    </div>
    <div
      v-if="chartData"
      class="trend-wrapper"
    >
      <trend
        :data="chartData"
        :gradient="['#fabc57']"
        :stroke-width="5"
        auto-draw
        smooth
      />
    </div>
    <!-- <div class="wallet-buttons">
      <q-btn-group>
        <q-btn
          :disabled="cantSend"
          icon="send"
          size="md"
          color="primary"
          label="Send"
          class="wallet-group-btn"
          flat
          @click.stop="send"
        />
        <q-btn
          icon="call_received"
          size="md"
          color="primary"
          label="Receive"
          class="wallet-group-btn"
          flat
          @click.stop="receive"
        />
        <q-btn
          v-if="showChart"
          size="lg"
          color="primary"
          icon="timeline"
          class="wallet-group-btn just-icon"
          flat
          @click.stop="prices"
        />
      </q-btn-group>
    </div> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';
import CoinHeader from '@/components/Wallet/CoinHeader';
import { getBalance } from '@/helpers';

export default {
  name: 'CloudListItem',
  components: {
    CoinHeader,
  },
  props: {
    wallet: {
      type: Object,
      required: true,
    },
    currency: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      chartData: null,
    };
  },
  computed: {
    ...mapState({
      authenticatedAccount: (state) => {
        return state.settings.authenticatedAccount;
      },
      delay: (state) => { return state.settings.delay; },
    }),
    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },
    showChart() {
      const chartData = this.$store.getters['entities/prices/find'](`${this.wallet.name.toLowerCase()}_${this.selectedCurrency.code}_day`);
      if (chartData) {
        return true;
      }
      return false;
    },
    cantSend() {
      return getBalance(this.wallet, this.authenticatedAccount).available === 0;
    },
  },

  methods: {
    send() {
      this.$router.push({ path: `/wallet/send/${this.wallet.id}` });
    },
    receive() {
      this.$router.push({ path: `/wallet/receive/${this.wallet.id}` });
    },
    prices() {
      this.$router.push({ path: `/wallet/prices/${this.wallet.id}` });
    },
    goToWallet() {
      this.$router.push({ path: `/wallet/single/${this.wallet.id}` });
    },
  },
};
</script>

<style>
.cloud-item {
  box-shadow: 0px 10px 10px rgba(0,0,0,0.1);
  border-radius: 5px;
}
.cloud-item:hover {
      -webkit-transform: translateY(-4px);
    -ms-transform: translateY(-4px);
    transform: translateY(-4px);
    box-shadow: 0px 15px 10px rgba(0,0,0,0.15);
}

.wallet-cloud {
  width: 100%;
  border-radius: 0.4em;
  padding-bottom: 0.2em;
  background: white;
  color: #1e3c57;
  /* border: 1px solid rgba(0, 0, 0, 0.03); */
  margin-bottom: 0.5em;
  box-shadow: inset -2px -2px 0px 2px rgba(29, 59, 86, 0.35);
}

.cloud-top-row {
  padding: 1em 1em 0em 1em;
}

.trend-wrapper {
  opacity: 0.7;
  margin: .5em 0;
  padding: 0 1em;
}

.wallet-buttons {
  border-top: 1px solid #f2f3f5;
  margin-right: 0.25rem;
  margin-top: 1rem;
}

.wallet-buttons .q-btn-group {
  width: 100%;
  display: flex;
  align-items: stretch;
}

.wallet-buttons .q-btn {
  display: block;
  flex: 1;
  white-space: nowrap;
}

.wallet-buttons .q-btn__content {
  font-size: 1.1em;
  color: #1e3c57;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.wallet-group-btn {
  background: transparent;
  padding: 0 .5rem;
}

.wallet-group-btn i {
  margin-right: 0.5em;
  position: relative;
  top: -0.05rem;
}

.wallet-group-btn.just-icon {
  min-height: 2.5rem!important;
}

.wallet-group-btn.just-icon i {
  margin-right: 0;
  font-size: 2rem;
  text-align: right;
}

.wallet-group-btn .q-btn__content {
  font-size: 0.8rem;
}
</style>
