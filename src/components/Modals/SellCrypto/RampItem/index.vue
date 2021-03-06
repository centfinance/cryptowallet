<template>
  <div>
    <q-item
      clickable
      @click="openRamp"
    >
      <q-item-section avatar>
        <img
          class="payment-logo"
          src="@/statics/payment-logos/ramp.svg"
        >
      </q-item-section>
      <q-item-section class="text-weight-bold">
        <q-item-label
          caption
          class="justify-end text-right"
        >
          <q-chip
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
          caption
          class="text-right"
        >
          <q-chip
            square
            icon="fas fa-university"
            size="12px"
          >
            1.95%
          </q-chip>
          <q-chip
            square
            icon="fas fa-credit-card"
            size="12px"
          >
            2.9%
          </q-chip>
          <q-chip
            square
            icon="fab fa-cc-apple-pay"
            size="12px"
          >
            2.9%
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
import { ramp } from '@/helpers/Ramp';
import Payments from '@/store/wallet/entities/payments';
import Coin from '@/store/wallet/entities/coin';
import Wallet from '@/store/wallet/entities/wallet';

export default {
  name: 'RampItem',
  data() {
    return {
      ramp: null,
    };
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
      return this.defaultWallet;
    },
    isTestnet() {
      return Coin.findToken(this.wallet.name).testnet;
    },
  },

  beforeDestroy() {
    if (this.ramp) {
      this.ramp.unsubscribe('*', () => {});
    }
  },


  methods: {
    openRamp() {
      this.ramp = ramp(this.account, this.wallet, this.isTestnet);
      this.ramp.domNodes.overlay.style.zIndex = 998;
      this.ramp.domNodes.iframe.style.height = '96vh';
      this.ramp.domNodes.iframe.style.paddingTop = '35px';
      this.ramp.domNodes.iframe.style.maxWidth = '600px';
      this.$emit('loading', { on: true, logo: 'statics/payment-logos/ramp.svg' });
      setTimeout(() => {
        this.ramp.show();
        this.ramp.on('*', (data) => {
          if (data.type === 'WIDGET_CONFIG_DONE') { this.handleWidgetOpen(); }
          if (data.type === 'WIDGET_CLOSE') { this.handleWidgetClose(); }
        // if (data.eventName === 'TRANSAK_ORDER_CREATED') { this.handleOrderCreated(data); }
        // if (data.eventName === 'TRANSAK_ORDER_SUCCESSFUL') { this.handleOrderSuccess(data); }
        });
      }, this.delay.normal);

      // this.$emit('setProvider', this.transak);
    },

    handleWidgetOpen() {
      setTimeout(() => {
        this.$emit('loading', { on: false, logo: null });
      }, this.delay.long);
    },

    handleWidgetClose() {
      this.ramp.unsubscribe('*', () => {});
    },

    handleOrderCreated(order) {
      if (order && order.type) {
        Payments.$insert({
          data: {
            id: order.payload.purchase.id,
            account_id: this.authenticatedAccount,
            wallet_id: this.id,
            address: this.wallet.externalAddress,
            event: order.type,
            status: order.type,
            isBuyOrSell: 'SELL',
            currency: order.payload.fiatCurrency,
            fiatAmount: order.payload.fiatValue,
            cryptoAmount: order.payload.cryptoAmount,
            conversionPrice: order.payload.assetExchangeRate,
            // totalFeeInCrypto: order.status.totalFeeInCrypto,
            // totalfeeInFiat: order.status.totalFeeInFiat,
            // paymentOption: order.status.paymentOption[0],
            fromAddress: order.payload.escrowAddress,
            expires: order.payload.purchase.endTime,
          },
        });
      }
    },

    handleOrderSuccess(order) {
      Payments.$update({
        where: order.status.id,
        data: {
          event: order.type,
          status: order.type,
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
.overlay {
  padding-top: 35px;
}
</style>
