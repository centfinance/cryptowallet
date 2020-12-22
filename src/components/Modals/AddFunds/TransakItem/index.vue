<template>
  <div>
    <q-item
      clickable
      @click="openTransak"
    >
      <q-item-section avatar>
        <img
          class="payment-logo"
          src="@/statics/payment-logos/transak.png"
        >
      </q-item-section>
      <q-item-section class="text-weight-bold">
        <q-item-label
          caption
          class="text-right"
        >
          <q-chip
            v-if="card"
            color="warning"
            text-color="black"
            size="sm"
          >
            No ID Required
          </q-chip>
          <q-chip
            color="info"
            text-color="white"
            size="sm"
          >
            Instant
          </q-chip>
        </q-item-label>
        <q-item-label
          v-if="bank"
          caption
          class="text-right"
        >
          <q-chip
            square
            icon="fas fa-university"
            size="12px"
          >
            0.5%
          </q-chip>
        </q-item-label>
        <q-item-label
          v-if="card"
          caption
          class="text-right"
        >
          <q-chip
            square
            icon="fas fa-credit-card"
            size="12px"
          >
            3.9%
          </q-chip>
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-item-label caption>
          <q-icon
            name="keyboard_arrow_right"
            size="sm"
          />
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { transak } from '@/helpers/Transak';
import Payments from '@/store/wallet/entities/payments';
import Coin from '@/store/wallet/entities/coin';
import Wallet from '@/store/wallet/entities/wallet';


export default {
  name: 'TransakItem',
  props: {
    country: {
      required: true,
      type: Object,
    },
    card: {
      type: Boolean,
      required: false,
      default: false,
    },
    bank: {
      type: Boolean,
      required: false,
      default: false,
    },
    tokens: {
      type: String,
      required: false,
      default: '',
    },
  },

  computed: {
    ...mapState({
      id: (state) => { return parseInt(state.route.params.id, 10); },
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      delay: (state) => { return state.settings.delay; },
    }),
    account() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount);
    },
    defaultWallet() {
      return Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .where('name', 'Ethereum')
        .get()[0];
    },
    wallet() {
      if (this.id) {
        return this.$store.getters['entities/wallet/find'](this.id);
      }
      return {
        externalAddress: this.defaultWallet.externalAddress,
      };
    },
    isTestnet() {
      if (this.id) {
        return Coin.findToken(this.wallet.name).testnet;
      }
      return false;
    },

    transak() {
      if (this.country) {
        return transak(
          this.account, this.wallet, this.tokens, this.country.value, this.card, this.isTestnet,
        );
      }
      const country = {
        currencyCode: 'GBP',
        alpha2: 'GB',
      };
      return transak(this.wallet, country, this.card, true);
    },
  },

  beforeDestroy() {
    try {
      this.transak.prototype.removeAllListeners();
    } catch {
      // eslint-disable-next-line no-console
      console.error('implement transak removeAllListeners function');
    }
  },


  methods: {
    openTransak() {
      this.transak.on(this.transak.ALL_EVENTS, (data) => {
        if (data.eventName === 'TRANSAK_WIDGET_OPEN') { this.handleWidgetOpen(); }
        if (data.eventName === 'TRANSAK_WIDGET_CLOSE') { this.handleWidgetClose(); }
        if (data.eventName === 'TRANSAK_ORDER_CREATED') { this.handleOrderCreated(data); }
        if (data.eventName === 'TRANSAK_ORDER_SUCCESSFUL') { this.handleOrderSuccess(data); }
      });
      this.$emit('loading', { on: true, logo: 'statics/payment-logos/transak.png' });
      this.$emit('setProvider', this.transak);

      this.transak.init();
    },

    closeTransak() {
      this.transak.close();
    },

    handleWidgetOpen() {
      setTimeout(() => {
        this.$emit('loading', { on: false, logo: null });
      }, this.delay.long);
    },

    handleWidgetClose() {
      this.transak.close();
      this.transak.isInitialised = false;
      this.transak.removeAllListeners();
    },

    handleOrderCreated(order) {
      if (order && order.status) {
        Payments.$insert({
          data: {
            id: order.status.id,
            account_id: this.authenticatedAccount,
            wallet_id: this.id,
            address: this.wallet.externalAddress,
            event: order.eventName,
            status: order.status.status,
            isBuyOrSell: order.status.isBuyOrSell,
            currency: order.status.fiatCurrency,
            fiatAmount: order.status.fiatAmount,
            cryptoAmount: order.status.cryptoAmount,
            conversionPrice: order.status.conversionPrice,
            totalFeeInCrypto: order.status.totalFeeInCrypto,
            totalfeeInFiat: order.status.totalFeeInFiat,
            paymentOption: order.status.paymentOption[0],
            fromAddress: order.status.fromWalletAddress,
            expires: order.status.autoExpiresAt,
          },
        });
      }
    },

    handleOrderSuccess(order) {
      Payments.$update({
        where: order.status.id,
        data: {
          event: order.eventName,
          status: order.status.status,
        },
      });
    },

    // handleOrderFailed(order) {
    //   console.log(order);
    // },
  },
};
</script>

<style lang="scss">
.transak_modal {
  padding-top: 35px;
}

.transak_close {
  display: none;
}

body.desktop .transak_modal {
  max-width: 600px;
}
</style>
