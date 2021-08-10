<template>
  <div>
    <div class="send-coin-box">
      <div class="send-modal-heading">
        <h4>
          {{ $t('availableBalance') }}
          <q-icon
            name="help_outline"
            size="1.1rem"
            class="help-icon"
            @click="availableFundsDialogOpened = true"
          />
        </h4>
        <span class="h3-line" />

        <q-dialog
          v-model="availableFundsDialogOpened"
        >
          <q-card
            style="width: 300px"
            class="dialog"
          >
            <q-card-section>
              <h2>
                {{ $t('availableBalance') }}
              </h2>
              <p>
                {{ $t('availableBalanceExplanation') }}
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

      <div
        class="available-amount"
        :class="{ 'full': unconfirmedBalance() === availableBalance() }"
      >
        <Amount
          v-if="latestPrice"
          :amount="availableBalance()"
          :rate="latestPrice"
          :prepend-plus-or-minus="false"
          :currency="selectedCurrency"
          :to-currency="true"
          :coin="wallet.name"
          format="0,0[.]00"
        />
        <div class="in-coin">
          {{ availableBalanceInCoin() }} {{ coinSymbol }}
        </div>
      </div>

      <div class="send-modal-heading">
        <h3>{{ $t('recipient') }}</h3>
        <span class="h3-line" />
        <q-btn
          :label="$t('paste')"
          size="sm"
          class="send-heading-btn paste-btn"
          @click="paste"
        />
      </div>

      <div class="to">
        <q-input
          v-model="address"
          :error="$v.address.$error"
          placeholder="address"
          class="sm-input address-input"
          outlined
          dense
          color="primary"
          @blur="checkField('address')"
          @input="checkField('address')"
        />
        <div
          class="side-content qr-code-wrapper"
          @click="scan"
        >
          <div class="hor-line" />
          <div class="ver-line" />
          <img src="~assets/QR.svg">
        </div>
      </div>
      <span class="error-label error-label-address">
        {{ addressError }}
      </span>
      <div class="send-modal-heading">
        <h3>{{ $t('amount') }}</h3>
        <span class="h3-line" />
        <q-btn
          :label="$t('max')"
          :class="{ active: maxed }"
          size="sm"
          class="send-heading-btn max-button"
          @click="max"
        />
      </div>

      <div class="amount">
        <div class="amount-div-wrapper">
          <q-input
            ref="inCoin"
            v-model="inCoin"
            :disable="maxed"
            :error="$v.inCoin.$error"
            type="number"
            placeholder="0"
            class="sm-input amount-in-coin"
            outlined
            dense
            color="primary"
            @focus="updateInCoinFocus(true)"
            @focus.native="updateInCoinFocus(true)"
            @blur="updateInCoinFocus(false)"
            @blur.native="updateInCoinFocus(false)"
            @input="validateInput('inCoin')"
          />
          <div class="side-content">
            {{ coinSymbol }}
          </div>
        </div>
        <div class="amount-div-wrapper">
          <q-input
            v-model="inCurrency"
            :disable="maxed"
            :error="$v.inCurrency.$error"
            type="number"
            placeholder="0"
            class="sm-input amount-in-currency"
            outlined
            dense
            color="primary"
            @focus="updateInCurrencyFocus(true)"
            @focus.native="updateInCurrencyFocus(true)"
            @blur="updateInCurrencyFocus(false)"
            @blur.native="updateInCurrencyFocus(false)"
            @input="validateInput('inCoin')"
          />
          <div class="side-content">
            {{ selectedCurrency.code }}
          </div>
        </div>
      </div>
      <span class="error-label error-label-amount">
        {{ amountError }}
      </span>
      <div class="send-modal-heading">
        <h3>
          {{ $t('fee') }}
        </h3>
        <span class="h3-line" />
      </div>

      <div>
        <div class="fee">
          <q-slider
            v-model="feeSetting"
            :label-value="customFeeLabel(feeSetting)"
            :min="0"
            :max="2"
            :step="1"
            color="blueish"
            label-always
            snap
            markers
            @input="feeChange"
          />
        </div>
        <div class="estimated-fee">
          {{ $t('estimatedTransaction') }} {{ estimatedFee }}
        </div>
      </div>

      <div class="send">
        <q-btn
          :label="$t('send')"
          color="blueish"
          class="send-btn"
          size="md"
          @click="send"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {
  required,
  alphaNum,
  between,
} from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import { debounce } from 'quasar';
import {
  AmountFormatter,
  getBalance,
} from '@/helpers';
import Address from '@/store/wallet/entities/address';
import Utxo from '@/store/wallet/entities/utxo';
import Coin from '@/store/wallet/entities/coin';
import Amount from '@/components/Wallet/Amount';

const delay = 500;
export default {
  name: 'SendCoin',
  components: {
    Amount,
  },
  data() {
    return {
      address: '',
      addressLengthMin: 26,
      addressLengthMax: 35,
      inCoin: '',
      inCurrency: '',
      inCoinFocus: false,
      inCurrencyFocus: false,
      feeSetting: 1,
      estimatedFee: this.$t('N/A'),
      maxValueCoin: Infinity,
      maxValueCurrency: Infinity,
      maxed: false,
      addressError: '',
      amountError: '',
      feeDialogOpened: false,
      availableFundsDialogOpened: false,
    };
  },
  validations() {
    return {
      address: {
        required,
        alphaNum,
        between(value) {
          return value.length <= this.addressLengthMax && value.length >= this.addressLengthMin;
        },
        isValidAddress(value) {
          return this.validateAddress(value);
        },
      },
      inCoin: {
        required,
        between: between(0, this.maxValueCoin),
      },
      inCurrency: {
        required,
        between: between(0, this.maxValueCurrency),
      },
    };
  },
  computed: {
    ...mapState({
      id: (state) => { return state.route.params.id; },
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      delay: (state) => { return state.settings.delay; },
      scannedAddress: (state) => { return state.qrcode.scannedAddress; },
      scannedAmount: (state) => { return state.qrcode.scannedAmount; },
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
    coinSymbol() {
      return this.supportedCoins.find((coin) => { return coin.name === this.wallet.name; })
        .symbol;
    },
    coinDenomination() {
      return this.supportedCoins.find((coin) => { return coin.name === this.wallet.name; })
        .denomination;
    },
    latestPrice() {
      const prices = this.$store.getters['entities/latestPrice/find'](`${this.wallet.identifier}_${this.selectedCurrency.code}`);
      if (!prices) {
        this.backEndService.loadPriceFeed();
        return null;
      }
      return prices.data.PRICE;
    },
    utxos() {
      return Utxo.query()
        .where('account_id', this.authenticatedAccount)
        .where('wallet_id', this.wallet.id)
        .where('pending', false)
        .get();
    },
  },
  watch: {
    inCoin(val) {
      if (val === null || val === '') {
        this.inCurrency = '';
        this.validateInput('inCoin');
        return false;
      }

      if (!this.inCurrencyFocus) {
        this.inCurrency = this.amountToCurrency(val);
      }
      this.updateFee(this.feeSetting, this);
      this.validateInput('inCoin');
      return false;
    },
    inCurrency(val) {
      if (val === null || val === '') {
        this.inCoin = '';
        return false;
      }
      if (this.inCurrencyFocus && !this.maxed) {
        this.inCoin = this.currencyToCoin(val);
      }
      this.updateFee(this.feeSetting, this);
      return false;
    },
  },

  mounted() {
    setTimeout(async () => {
      try {
        await this.getMaxedTx();
        if (this.scannedAmount) {
          this.inCoin = this.scannedAmount;
          this.$store.dispatch('qrcode/setScannedAmount', null);
        }
      } catch (err) {
        this.errorHandler(err);
      }
    }, this.delay.normal);

    if (this.scannedAddress) {
      this.address = this.scannedAddress;
      this.$store.dispatch('qrcode/setScannedAddress', null);
    }
  },

  methods: {
    updateInCoinFocus(val) {
      if (!val) {
        if (this.inCoin > 0) {
          this.inCoin = this.formatAmount(this.inCoin, this.coinDenomination);
        }
        this.validateInput('inCoin');
      }
      this.inCoinFocus = val;
    },
    updateInCurrencyFocus(val) {
      if (!val) {
        if (this.inCurrency > 0) {
          this.inCurrency = this.formatAmount(this.inCurrency, '0.00');
        }
        this.validateInput('inCoin');
      }
      this.inCurrencyFocus = val;
    },

    validateInput(field) {
      this.checkField(field);
    },

    validateAddress(address) {
      const coinSDK = this.coinSDKS[this.wallet.sdk];
      return coinSDK.validateAddress(address, this.wallet.network);
    },

    async checkField(field) {
      if (field === 'address') {
        this.$v.address.$touch();

        if (!this.$v.address.between) {
          this.addressError = this.$t('bitcoinAddressInvalidLength');
          return false;
        }

        if (!this.$v.address.isValidAddress) {
          this.addressError = this.$t('bitcoinAddressInvalid');
          return false;
        }

        this.addressError = '';
      }

      if (field === 'inCoin') {
        this.$v.inCoin.$touch();
        this.$v.inCurrency.$touch();

        if (!this.$v.inCoin.between) {
          this.amountError = this.$t('notEnoughFunds');
        } else {
          this.amountError = '';
        }

        if (!this.$v.inCoin.$model) {
          this.amountError = this.$t('noAmount');
        }
      }

      return true;
    },

    formatAmount(amount, format) {
      const formattedAmount = new AmountFormatter({
        amount,
        format,
      });

      return formattedAmount.getFormatted();
    },

    /**
     * Converts coins to currency as user types
     */
    amountToCurrency(amount) {
      const formattedAmount = new AmountFormatter({
        amount,
        rate: this.latestPrice,
        format: '0.00',
        coin: this.wallet.name,
        prependPlusOrMinus: false,
        currency: this.selectedCurrency,
        toCurrency: true,
      });

      return formattedAmount.getFormatted();
    },

    /**
     * Converts currency to coin as user types
     */
    currencyToCoin(amount) {
      const formattedAmount = new AmountFormatter({
        amount,
        rate: this.latestPrice,
        format: this.coinDenomination,
        coin: this.wallet.name,
        prependPlusOrMinus: false,
        currency: this.selectedCurrency,
        toCoin: true,
      });

      return parseFloat(formattedAmount.getFormatted());
    },

    /**
     * Allows to display a custom fee label on Quasar component
     */
    customFeeLabel(feeSetting) {
      if (feeSetting === 0) { return this.$t('lowFeeLabel'); }
      if (feeSetting === 1) { return this.$t('mediumFeeLabel'); }
      return this.$t('highFeeLabel');
    },

    /**
     * Calls update fee with context passed when user adjusts fee
     */
    feeChange(fee) {
      if (!this.maxed) { this.updateFee(fee, this); }
      if (this.maxed) { this.updateMax(); }
    },

    /**
     * Creates a raw transaction which will calculate and update the fee
     */
    updateFee: debounce((fee, that) => {
      const online = window ? window.navigator.onLine : navigator.connection === 'none';
      if (!that.$v.inCoin.$invalid && online) {
        const wallet = that.activeWallets[that.authenticatedAccount][that.wallet.name];
        const accounts = that.getAccounts();
        const changeAddresses = that.generateChangeAddresses();

        const { address } = that.getAddresses()[0];

        that.createRawTx(
          accounts,
          changeAddresses,
          that.utxos,
          wallet,
          address,
          that.inCoin,
        );
      } else {
        that.estimatedFee = that.$t('N/A');
      }
    }, delay),

    /**
     * Returns addresses
     * @return {Array<Object>}
     */
    getAddresses() {
      return Address.query()
        .where('account_id', this.authenticatedAccount)
        .where('wallet_id', this.wallet.id)
        .where('used', false)
        .get();
    },

    /**
     * Returns accounts
     * @return {Array<Object>}
     */
    getAccounts() {
      const addresses = this.getAddresses();
      function mapToAccounts(item) {
        return {
          address: item.address,
          index: item.index,
          change: item.chain === 'internal',
        };
      }

      return addresses.map(mapToAccounts);
    },

    /**
     * Generates change addresses
     * @param  {Array<Object>} filteredUtxos
     * @param  {Number} pendingCount
     * @return {Array<String>}
     */
    generateChangeAddresses() {
      const quantityToGenerate = 1;

      const coinSDK = this.coinSDKS[this.wallet.sdk];
      const wallet = this.activeWallets[this.authenticatedAccount][this.wallet.name];

      const changeAddresses = [];

      for (let i = 0; i <= quantityToGenerate - 1; i += 1) {
        const nextIndex = this.wallet.internalChainAddressIndex + i;
        const { address } = coinSDK.generateKeyPair(wallet, nextIndex, true);
        changeAddresses.push(address);
      }

      return changeAddresses;
    },

    async getFee() {
      const response = await this.backEndService.getTransactionFee(this.wallet.symbol);
      const fees = response.data;
      const kbToBytes = 1000;

      let fee = fees.medium / kbToBytes;
      if (this.feeSetting === 0) {
        fee = fees.low / kbToBytes;
      }
      if (this.feeSetting === 2) {
        fee = fees.high / kbToBytes;
      }

      fee = Math.round(fee);
      return fee;
    },

    /**
     * Creates a raw transaction and updates the fee
     * @param  {Array<Object>} accounts
     * @param  {Array<String>} changeAddresses
     * @param  {Array<Object>} filteredUtxos
     * @param  {Object} wallet
     * @param  {String} address
     * @param  {Number} amount
     * @return {Object}
     */
    async createRawTx(
      accounts,
      changeAddresses,
      filteredUtxos,
      wallet,
      address,
      amount,
    ) {
      if (!address || !amount) { return false; }

      const coinSDK = this.coinSDKS[this.wallet.sdk];
      const fee = await this.getFee();
      if (this.maxed) {
        amount = 0;
      }

      try {
        const { hexTx, transaction, utxo } = await coinSDK.createRawTx(
          accounts,
          changeAddresses,
          filteredUtxos,
          wallet,
          address,
          amount,
          fee,
          this.maxed,
        );

        const formattedFee = new AmountFormatter({
          amount: transaction.fee,
          rate: this.latestPrice,
          format: '0.00',
          coin: this.wallet.name,
          currency: this.selectedCurrency,
          toCurrency: true,
          withCurrencySymbol: true,
        });
        const decimals = 6;
        this.estimatedFee = `${transaction.fee.toFixed(decimals)} ${this.wallet.symbol} (${formattedFee.getFormatted()})`;

        return {
          hexTx,
          transaction,
          utxo,
        };
      } catch (err) {
        this.errorHandler(err);
      }

      return false;
    },

    /**
     * Validates input fields
     * @return {Boolean}
     */
    isInvalid() {
      if (!this.address) { return this.$t('fillAllInputs'); }
      if (!this.inCoin) { return this.$t('fillAllInputs'); }
      if (this.addressError) { return this.addressError; }
      if (this.amountError) { return this.amountError; }

      return false;
    },

    availableBalance() {
      return getBalance(this.wallet, this.authenticatedAccount).available;
    },

    unconfirmedBalance() {
      return getBalance(this.wallet, this.authenticatedAccount).unconfirmed;
    },

    availableBalanceInCoin() {
      const balance = getBalance(this.wallet, this.authenticatedAccount).available;

      const balanceInCoin = new AmountFormatter({
        amount: balance,
        rate: this.latestPrice,
        format: '0.00000000',
        prependPlusOrMinus: false,
        removeTrailingZeros: true,
      });

      return balanceInCoin.getFormatted();
    },

    /**
     * Creates and sends a transaction
     */
    async send() {
      const online = window ? window.navigator.onLine : navigator.connection === 'none';
      if (online) {
        if (this.isInvalid()) {
          this.$toast.create(10, this.isInvalid(), this.delay.normal);
          return false;
        }

        const wallet = this.activeWallets[this.authenticatedAccount][
          this.wallet.name
        ];

        const changeAddresses = this.generateChangeAddresses();
        const accounts = this.getAccounts();

        const { hexTx, transaction, utxo } = await this.createRawTx(
          accounts,
          changeAddresses,
          this.utxos,
          wallet,
          this.address,
          this.inCoin,
        );

        this.$store.dispatch('modals/setConfirmTransactionData', {
          hexTx,
          transaction,
          changeAddresses,
          utxo,
        });

        this.$store.dispatch('modals/setConfirmSendModalOpened', true);
      }
      return false;
    },

    /**
     * Pastes in the text from the clipboard
     */
    paste() {
      try {
        if (cordova) {
          cordova.plugins.clipboard.paste((text) => {
            this.address = text;
          });
        }
      } catch (err) {
        this.errorHandler(err);
      }
    },

    async max() {
      if (this.maxed) {
        this.maxed = false;
        this.inCoin = '';
        this.inCurrency = '';
        this.estimatedFee = this.$t('N/A');
        return false;
      }

      this.maxed = true;
      this.updateMax();
      return false;
    },

    async getMaxedTx() {
      const changeAddresses = this.generateChangeAddresses();
      const wallet = this.activeWallets[this.authenticatedAccount][
        this.wallet.name
      ];

      const accounts = this.getAccounts();
      const { address } = this.getAddresses()[0];

      const fee = await this.getFee();

      const coinSDK = this.coinSDKS[this.wallet.sdk];
      const { transaction } = await coinSDK.createRawTx(
        accounts,
        changeAddresses,
        this.utxos,
        wallet,
        address,
        0,
        fee,
        true,
      );

      this.maxValueCoin = transaction.value;
      this.maxValueCurrency = this.amountToCurrency(transaction.value);
      return transaction;
    },

    async updateMax() {
      const transaction = await this.getMaxedTx();

      const formattedFee = new AmountFormatter({
        amount: transaction.fee,
        rate: this.latestPrice,
        format: '0.00',
        coin: this.wallet.name,
        currency: this.selectedCurrency,
        toCurrency: true,
        withCurrencySymbol: true,
      });

      this.estimatedFee = formattedFee.getFormatted();
      this.inCoin = transaction.value;
      this.$refs.inCoin.focus();
    },

    /**
     * Initiates the QR code scanner
     */
    scan() {
      this.$store.dispatch('qrcode/scanQRCode');
      this.$store.dispatch('modals/setSendCoinModalOpened', false);
      const invalidAddress = this.$t('bitcoinAddressInvalid');
      if (typeof QRScanner !== 'undefined') {
        setTimeout(() => {
          const scanQR = () => {
            return QRScanner.scan((err, text) => {
              if (err) {
                this.errorHandler(err);
              } else {
                let amount;
                if (text.includes(':')) {
                  const query = new URL(text);
                  const walletName = this.wallet.name.replace(/\s/g, '').toLowerCase();
                  if (query.protocol.slice(0, -1) === walletName) {
                    text = query.pathname;
                    const queryParams = new URLSearchParams(query.search);
                    if (queryParams.has('amount')) {
                      amount = queryParams.get('amount');
                    }
                  }
                }

                const coinSDK = this.coinSDKS[this.wallet.sdk];
                const isValid = coinSDK.validateAddress(text, this.wallet.network);

                if (isValid) {
                  this.$store.dispatch('qrcode/setScannedAddress', text);
                  if (amount) {
                    this.$store.dispatch('qrcode/setScannedAmount', amount);
                  }
                  this.$store.dispatch('qrcode/cancelScanning');
                  this.$store.dispatch('modals/setSendCoinModalOpened', true);
                } else {
                  this.$toast.create(10, invalidAddress, this.delay.normal);
                  const waitForToast = 5000;
                  setTimeout(() => { return scanQR(); }, waitForToast);
                }
              }
            });
          };
          scanQR();
        }, this.delay.normal);
      }
    },
  },
};
</script>

<style>
.available-amount {
  font-family: 'CooperHewitt-BoldItalic';
  font-size: 0.8rem;
  margin-bottom: 1.5rem;
  color: #fd0000;
}

.available-amount.full {
  color: green;
}
</style>
