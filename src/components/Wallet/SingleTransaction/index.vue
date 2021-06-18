<template>
  <div>
    <q-item
      v-ripple
      clickable
      style="padding: 1rem"
      @click="details = true"
    >
      <q-item-section
        avatar
        top
      >
        <q-avatar
          :icon="icon"
          color="primary"
          text-color="white"
        />
      </q-item-section>

      <q-item-section>
        <q-item-label lines="1">
          {{ amount.word }} {{ amount.formatted }} {{ wallet.symbol }}
          <span v-if="latestPrice">({{ amount.currency }})</span>
        </q-item-label>
        <q-item-label caption>
          {{ date }}
        </q-item-label>
      </q-item-section>
      <q-item-section
        v-if="data.failed"
        class="text-center col-2"
      >
        <q-badge
          outline
          color="negative"
          label="Failed"
          style="width: fit-content;"
        />
      </q-item-section>
      <q-item-section side>
        <q-icon
          name="info"
        />
      </q-item-section>
    </q-item>

    <q-dialog
      v-model="openTxDialog"
    >
      <q-card>
        <q-card-section>
          <div class="transaction-heading">
            <div class="row justify-center">
              <q-avatar
                :icon="icon"
                color="primary"
                text-color="white"
                style="margin-bottom:1rem"
              />
            </div>

            <div class="row justify-center">
              {{ amount.prefix }} {{ data.value }} {{ wallet.symbol }}
            </div>

            <div
              v-if="latestPrice"
              class="row justify-center"
            >
              {{ amount.prefix }} {{ amount.currency }}
            </div>
            <div
              v-if="data.failed"
              class="row justify-center q-mt-sm"
            >
              <q-badge
                outline
                color="negative"
                label="Failed"
                style="width: fit-content;"
              />
            </div>
          </div>

          <div class="single-transaction-content">
            <div class="row justify-between">
              <div class="col-2">
                {{ paymentDirection.prefix }}
              </div>
              <div class="col-10">
                <div
                  v-if="ens"
                  class="text-weight-bold"
                >
                  {{ ens }}
                </div>

                <span class="tx-hash break">
                  {{ paymentDirection.address }}
                </span>

                <q-btn
                  icon="content_copy"
                  size="xs"
                  flat
                  round
                  dense
                  style="margin-top=0"
                  @click="copy(paymentDirection.address)"
                />
              </div>
            </div>

            <div class="row justify-between">
              <div class="col-2">
                {{ $t('txHash') }}:
              </div>
              <div class="col-10">
                <span class="tx-hash break">
                  {{ data.hash }}
                  <q-btn
                    icon="content_copy"
                    size="xs"
                    flat
                    round
                    dense
                    style="padding-top=0"
                    @click="copy(data.hash)"
                  />
                </span>
              </div>
            </div>

            <div class="row justify-between">
              <div>
                {{ $t('status') }}:
              </div>
              <div>
                <span
                  :class="{
                    'status': true,
                    'unconfirmed-tx': data.confirmations < minConfirmations,
                    'confirmed-tx': data.confirmations >= minConfirmations,
                  }"
                >
                  {{ status }}
                </span>
              </div>
            </div>

            <div class="row justify-between">
              <div>
                {{ $t('confirmations') }}:
              </div>
              <div>
                <span class="confirmations">
                  {{ data.confirmations }}
                </span>
              </div>
            </div>

            <div class="row justify-between">
              <div>
                {{ $t('fee') }}:
              </div>
              <div>
                <span class="tx-fee">
                  {{ feeFormated }}
                </span>
              </div>
            </div>

            <div class="row justify-between">
              <div>
                {{ $t('blockHeight') }}:
              </div>
              <div>
                <span class="tx-height">
                  {{ data.blockHeight }}
                </span>
              </div>
            </div>
            <div class="row justify-end">
              <q-btn
                v-close-popup
                :label="$t('close')"
                flat
                round
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { dateTranslater, AmountFormatter } from '@/helpers';
import Coin from '@/store/wallet/entities/coin';

export default {
  name: 'SingleTransaction',

  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      details: false,
      ens: null,
    };
  },

  computed: {
    ...mapState({
      id: (state) => { return state.route.params.id; },
      delay: (state) => { return state.settings.delay; },
      newTx: (state) => { return state.modals.newTxData; },
    }),
    wallet() {
      return this.$store.getters['entities/wallet/find'](this.id);
    },
    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },
    supportedCoins() {
      return Coin.all();
    },
    coinDenomination() {
      return this.supportedCoins.find((coin) => {
        return coin.name === this.wallet.name;
      }).denomination;
    },
    minConfirmations() {
      return this.supportedCoins.find((coin) => {
        return coin.name === this.wallet.name;
      }).minConfirmations;
    },
    coinSymbol() {
      return this.supportedCoins.find((coin) => { return coin.name === this.wallet.name; }).symbol;
    },
    latestPrice() {
      const prices = this.$store.getters['entities/latestPrice/find'](`${this.wallet.identifier}_${this.selectedCurrency.code}`);
      if (prices) {
        return prices.data.PRICE;
      }
      return null;
    },

    /**
     * Prepends "To: " or "From: " into transaction title
     * @return {String}
     */
    paymentDirection() {
      if (this.data.sent) {
        let { receiver } = this.data;
        if (Array.isArray(receiver)) { [receiver] = receiver; }
        return {
          prefix: `${this.$t('to')}:`,
          address: receiver,
        };
      }

      let { sender } = this.data;
      if (Array.isArray(sender)) { [sender] = sender; }
      return {
        prefix: `${this.$t('from')}`,
        address: sender,
      };
    },

    /**
     * Returns formatted date of the transaction
     * @return {String}
     */
    date() {
      const msToS = 1000;
      if (this.data.receivedTime) {
        return dateTranslater(new Date(this.data.receivedTime * msToS).valueOf(), 'DD MMMM YYYY HH:mm', this);
      }
      return dateTranslater(new Date(this.data.confirmedTime * msToS).valueOf(), 'DD MMMM HH:mm YYYY', this);
    },

    icon() {
      if (this.data.sent) { return 'send'; }
      return 'call_received';
    },

    /**
     * Converts amount value (Number) into a String
     * @return {String}
     */
    amount() {
      const { value } = this.data;
      let inCoin = value;
      if (this.data.sent) { inCoin = -Math.abs(inCoin); }

      const amountInCoin = new AmountFormatter({
        amount: inCoin,
        rate: this.latestPrice,
        format: '0,0[.]00000',
        prependPlusOrMinus: false,
        removeTrailingZeros: true,
      });

      const result = {
        formatted: amountInCoin.getFormatted(),
        prefix: this.data.sent ? '-' : '+',
        word: this.data.sent ? this.$t('sent') : this.$t('received'),
      };

      if (this.latestPrice) {
        const amountInCurrency = new AmountFormatter({
          amount: inCoin,
          rate: this.latestPrice,
          format: '0,0[.]00',
          coin: this.wallet.name,
          prependPlusOrMinus: false,
          currency: this.selectedCurrency,
          toCurrency: true,
          toCoin: false,
          withCurrencySymbol: true,
        });

        result.currency = amountInCurrency.getFormatted();
        return result;
      }
      return result;
    },

    /**
     * Displays the fee
     * @return {String}
     */
    feeFormated() {
      const { fee } = this.data;
      const inCoin = fee;
      if (this.wallet.sdk === 'ERC20') {
        const parent = this.supportedCoins.find((coin) => {
          return coin.name === this.wallet.parentName;
        });
        if (this.$store.getters['entities/latestPrice/find'](`${parent.identifier}_${this.selectedCurrency.code}`) == null) { return ''; }
        const price = this.$store.getters['entities/latestPrice/find'](`${parent.identifier}_${this.selectedCurrency.code}`).data.PRICE;

        const feeInCoin = new AmountFormatter({
          amount: inCoin,
          rate: price,
          format: parent.denomination,
          prependPlusOrMinus: false,
          removeTrailingZeros: true,
        });

        const amountInCurrency = new AmountFormatter({
          amount: feeInCoin.getFormatted(),
          rate: price,
          format: '0,0[.]00',
          coin: this.wallet.parentName,
          prependPlusOrMinus: false,
          currency: this.selectedCurrency,
          toCurrency: true,
          toCoin: false,
          withCurrencySymbol: true,
        });
        return `${fee} ${parent.symbol} (${amountInCurrency.getFormatted()})`;
      }
      if (this.latestPrice) {
        const feeInCoin = new AmountFormatter({
          amount: inCoin,
          rate: this.latestPrice,
          format: this.coinDenomination,
          prependPlusOrMinus: false,
          removeTrailingZeros: true,
        });

        const amountInCurrency = new AmountFormatter({
          amount: feeInCoin.getFormatted(),
          rate: this.latestPrice,
          format: '0,0[.]00',
          coin: this.wallet.name,
          prependPlusOrMinus: false,
          currency: this.selectedCurrency,
          toCurrency: true,
          toCoin: false,
          withCurrencySymbol: true,
        });
        return `${fee} ${this.coinSymbol} (${amountInCurrency.getFormatted()})`;
      }

      return `${fee} ${this.coinSymbol}`;
    },

    /**
     * Returns the transaction status in a human friendly format
     * @return {String}
     */
    status() {
      if (this.data.confirmations >= this.minConfirmations) { return this.$t('confirmed'); }
      if (this.data.confirmations > 0) { return this.$t('unconfirmed'); }
      return this.$t('pending');
    },

    openTxDialog: {
      get() {
        if (this.newTx === this.data.hash) {
          return true;
        }
        if (this.details) {
          return true;
        }
        return false;
      },
      set(value) {
        if (!value) {
          this.$store.dispatch('modals/setNewTxData', null);
        }

        this.details = value;
      },
    },
  },
  async mounted() {
    await this.getUsername();
  },

  methods: {
    async getUsername() {
      const tx = this.$store.getters['entities/tx/find'](this.data.id);
      this.ens = await tx.ensName(this.paymentDirection.address);
    },
    copy(text) {
      try {
        if (window.cordova) {
          cordova.plugins.clipboard.copy(text);
        } else {
          this.$clipboard(text);
        }
        this.$toast.create(0, this.$t('copied'), this.delay.short);
      } catch (err) {
        this.errorHandler(err);
      }
    },
  },
};
</script>

<style>
.positive-amount .q-item__label,
.status.confirmed-tx {
  color: green;
}

.negative-amount .q-item__label,
.status.unconfirmed-tx {
  color: red;
}

.q-timeline-entry {
  padding-left: 1.5rem;
}

.q-item {
  padding: 0;
}

.q-timeline-content {
  padding-bottom: 0.5rem;
}

.q-timeline-title {
  margin-bottom: 0rem;
}

.q-timeline-dot:after {
  opacity: 0.1;
  left: 7px;
}

.q-timeline-dot:before, .q-timeline-dot:after {
    content: '';
    background: #4e677d;
    display: block;
    position: absolute;
}

.q-timeline-dot:before {
    border: 3px solid transparent;
    border-radius: 100%;
    height: 12px;
    width: 12px;
    top: 5px;
    left: 2px;
    transition: background 0.3s ease-in-out, border 0.3s ease-in-out;
}

.q-timeline {
  padding: 0.5rem;
}

.single-transaction-content {
  font-size: 0.8rem;
  color:#757575;
}
body.body--dark .single-transaction-content {
    color: whitesmoke;

}

.single-transaction-content .row {
  padding: 0.75rem 0;
  border-top: 1px solid #e0e0e0;
}

.body--dark .single-transaction-content .row {
  border-top: 1px solid #424242;
}

 .single-transaction-content .row .q-btn__wrapper {
    border-top: none;
  }

.single-transaction-content .justify-end {
  padding: 0.5rem;
  padding-bottom: 0;
}

.single-transaction-content .row .q-btn__content {
  padding: 0;
  border: none;
}


.q-timeline--dense--right
.q-timeline__entry {
  padding-left: 1.5rem;
}

.q-timeline__title {
  font-size: 1rem;
  padding-top: 0.1rem;
  margin-bottom: 0;
}

.q-expansion-item .q-item {
  min-height: 1rem;
}

.q-expansion-item .q-card__section {
  padding: 0;
}

.q-expansion-item .q-card__section p {
  margin: 0;
  padding: 0.5rem;
  border-top: 1px solid whitesmoke;
}

.q-expansion-item__container {
  border-top: 1px solid white;
}

.break {
  word-break: break-all;
}

.transaction-heading {
  padding: 1rem 0;
}
</style>
