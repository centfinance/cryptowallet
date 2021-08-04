<template>
  <div>
    <!-- <div class="header-section">
      <div class="header-back-button-wrapper">
        <q-btn
          icon="arrow_back"
          size="lg"
          class="icon-btn back-arrow-btn"
          flat
          @click.prevent="goBack"
        />
      </div>
      <h1 class="header-h1">
        {{ $t('receive') }}
      </h1>
      <div
        class="header-settings-button-wrapper"
      >
        <q-btn
          icon="share"
          color="secondary"
          size="lg"
          class="icon-btn icon-btn-right"
          flat
          @click.prevent="share()"
        />
      </div>
    </div> -->
    <div
      v-if="wallet"
      class="bg-white text-black q-pa-md rounded-border-top"
    >
      <div class="receive-coin-box q-gutter-y-lg">
        <div
          v-close-popup
          class="row justify-end"
        >
          {{ $t('done') }}
        </div>
        <div class="text-center text-h5 text-primary text-weight-bold">
          {{ $t('sendToWallet') }}
        </div>
        <div class="flex justify-center">
          <img
            v-if="qrCodeDataURL"
            :src="qrCodeDataURL"
            class="qr-code rounded-borders"
          >
        </div>

        <div
          class="q-px-xl text-h6 break text-center"
          @click="copyToClipboard"
        >
          {{ address }}
        </div>
        <div
          class="set-amount text-h6 row justify-center"
        >
          <q-expansion-item
            v-model="setAmount"
            :label="$t('setAmount')"
            popup
            @input="toggleSetAmount"
          >
            <q-card>
              <q-card-section>
                <span class="h3-line" />

                <q-input
                  v-model="amount"
                  type="number"
                  placeholder="0"
                  class="sm-input amount-in-coin"
                  outlined
                  dense
                  color="primary"
                  :suffix="wallet.symbol"
                  @input="qrCodeWithAddress"
                />
                <span class="error-label error-label-amount">
                  {{ amountError }}
                </span>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
        <div
          v-if="canShare"
          class="text-center q-mb-lg"
        >
          <q-btn
            rounded
            unelevated
            class="q-px-lg"
            color="primary"
            size="md"
            :label="$t('share')"
            @click.prevent="share()"
          />
        </div>

        <div
          v-if="wallet.sdk==='Bitcoin'"
          class="new-address row justify-center"
        >
          <p>
            {{ $t('newAddress1') }} {{ wallet.name }} {{ $t('newAddress2') }}
            <q-icon
              name="help_outline"
              size="1.1rem"
              class="help-icon"
              @click="hdWalletDialogOpened = true"
            />
          </p>
        </div>
        <q-dialog
          v-model="hdWalletDialogOpened"
        >
          <q-card
            style="width: 300px"
            class="dialog"
          >
            <q-card-section>
              <h2>
                {{ $t('hdWallet') }}
              </h2>
              <p>
                {{ $t('hdWalletExplainer') }}
              </p>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                v-close-popup
                flat
                :label="$t('ok')"
                color="blueish"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import QRCode from 'qrcode';
// import CoinHeader from '@/components/Wallet/CoinHeader';
import Coin from '@/store/wallet/entities/coin';

export default {
  name: 'Receive',
  components: {
    // CoinHeader,
  },
  data() {
    return {
      qrCodeDataURL: null,
      hdWalletDialogOpened: false,
      amount: null,
      amountError: '',
      setAmount: false,
    };
  },
  computed: {
    ...mapState({
      id: (state) => { return state.route.params.id; },
      delay: (state) => { return state.settings.delay; },
    }),
    wallet() {
      return this.$store.getters['entities/wallet/find'](this.id);
    },
    walletName() {
      return this.wallet.name.replace(/\s/g, '').toLowerCase();
    },
    address() {
      if (!this.wallet.externalAddress) {
        return this.wallet.erc20Wallet.address ? this.wallet.erc20Wallet.address : null;
      }
      return this.wallet.externalAddress;
    },
    decimals() {
      return Coin.findToken(this.wallet.name).decimals;
    },
    canShare() {
      return window.cordova || navigator.share;
    },
  },
  mounted() {
    this.qrCode();
  },
  methods: {
    copyToClipboard() {
      try {
        if (window.cordova) {
          cordova.plugins.clipboard.copy(this.address);
        } else {
          this.$clipboard(this.address);
        }
        // this.$toast.create(0, this.$t('copied'), this.delay.normal);
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
    toggleSetAmount(val) {
      if (!val) {
        this.amount = null;
        this.qrCode();
      }
    },
    countDecimals(value) {
      if (value.toString().split('.')[1]) {
        return value.toString().split('.')[1].length;
      }
      return 0;
    },
    qrCodeWithAddress() {
      if (this.amount > 0) {
        if (this.countDecimals(this.amount) <= this.decimals) {
          this.amountError = '';
          const newAddress = `${this.walletName}:${this.address}?amount=${this.amount}`;
          this.qrCode(newAddress);
        } else {
          this.amountError = this.$t('amountError');
          this.qrCode();
        }
      } else {
        this.qrCode();
      }
    },
    async qrCode(qrAddress = this.address) {
      const options = {
        width: 225,
        height: 225,
      };
      if (typeof this.address === 'string') {
        await QRCode.toDataURL(qrAddress, options, (err, url) => {
          if (err) {
            this.errorHandler(err);
          } else {
            this.qrCodeDataURL = url;
          }
        });
      }
    },
    share() {
      if (window.cordova) {
        const options = {
          message: `${this.address}`,
        };

        const onError = (msg) => {
          this.errorHandler(new Error(msg));
        };
        window.plugins.socialsharing.shareWithOptions(options, () => {}, onError);
      } else if (navigator.share) {
        navigator.share({
          title: 'My Cent wallet address',
          text: `Here is my ${this.wallet.name} address ${this.address}`,
        })
          .then(() => {})
          .catch((error) => {
            this.errorHandler(new Error(error));
          });
      }
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>

.address {
  font-size: 0.8rem;
  margin: 1rem 0;
}

.break {
  word-break: break-all;
}

.to-copy-input {
  position: absolute;
  left: -9999px;
}

.qr-code {
  margin: 0rem;
  display: flex;
  justify-content: center;
  border:1px solid lightgrey;
}

.share-btn {
  margin-left: 0.5rem;
}

.new-address {
  padding: 0 1rem;
  text-align: center;
}

.help-icon {
  background: white;
  z-index: 2;
  position: relative;
  top: -0.1rem;
  margin-left: 0.1rem;
  color: #e49ebe;
}

.receive-copy-btn {
  border: 1px solid #d4d4d4;
  background: whitesmoke;
  padding: 0;
  margin: 0 1px;
  width: 3rem;
  height: 0;
  min-height: 1.5rem;
  text-transform: none;
  font-family: Inter-SemiBold!important;
}

.set-amount .q-expansion-item--popup > .q-expansion-item__container {
  border: none;
}
</style>
