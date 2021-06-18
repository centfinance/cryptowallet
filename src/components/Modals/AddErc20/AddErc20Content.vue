<template>
  <div>
    <div class="header-section">
      <div class="header-back-button-wrapper">
        <q-btn
          icon="arrow_back"
          size="lg"
          text-color="primary"
          class="icon-btn back-arrow-btn"
          flat
          @click.prevent="goBack"
        />
      </div>
      <h1 class="header-h1">
        {{ $t('addToken') }}
      </h1>
    </div>
    <div
      class="modal-layout-wrapper"
    >
      <div class="send-coin-box">
        <div class="send-modal-heading">
          <h3>{{ $t('selectNetwork') }}</h3>
          <span class="h3-line" />
        </div>
        <div class="to q-mb-lg network-select">
          <q-select
            v-model="form.tokenNetwork"
            dense
            outlined
            :options="supportedNetworks"
            @input="checkContractOnNetworkChange"
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
              >
                <q-item-section>
                  <q-item-label>
                    <span class="q-pl-sm ">
                      {{ scope.opt.label }}
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="send-modal-heading">
          <h3>{{ $t('contractAddress') }}</h3>
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
            v-model="form.tokenContract"
            :error="$v.form.tokenContract.$error"
            placeholder="token contract address"
            class="sm-input contract-input"
            outlined
            dense
            @blur="checkField('contract')"
            @input="checkField('contract')"
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
        <span class="error-label error-label-contract">
          {{ contractError }}
        </span>
        <div class="send-modal-heading">
          <h3>{{ $t('tokenName') }}</h3>
          <span class="h3-line" />
        </div>
        <div class="to">
          <q-input
            v-model="form.tokenName"
            :error="$v.form.tokenName.$error"
            :disable="disableInputs"
            :loading="loadingInputs"
            :placeholder="$t('tokenName')"
            class="sm-input name-input"
            outlined
            dense
            @blur="checkField('name')"
            @input="checkField('name')"
          />
        </div>
        <span class="error-label error-label-name">
          {{ nameError }}
        </span>

        <div class="send-modal-heading">
          <h3>{{ $t('tokenSymbol') }}</h3>
          <span class="h3-line" />
        </div>
        <div class="to">
          <q-input
            v-model="form.tokenSymbol"
            :error="$v.form.tokenSymbol.$error"
            :disable="disableInputs"
            :loading="loadingInputs"
            :placeholder="$t('tokenSymbol')"
            class="sm-input symbol-input"
            outlined
            dense
            upper-case
            @blur="checkField('symbol')"
            @input="checkField('symbol')"
          />
        </div>
        <span class="error-label error-label-symbol">
          {{ symbolError }}
        </span>
        <div class="send-modal-heading">
          <h3>{{ $t('tokenDecimal') }}</h3>
          <span class="h3-line" />
        </div>
        <div class="to">
          <q-input
            v-model="form.tokenDecimals"
            :error="$v.form.tokenDecimals.$error"
            :disable="disableInputs"
            :loading="loadingInputs"
            :placeholder="$t('tokenDecimal')"
            class="sm-input decimals-input"
            type="number"
            outlined
            dense
            @blur="checkField('decimals')"
            @input="checkField('decimals')"
          />
        </div>
        <span class="error-label error-label-decimals">
          {{ decimalsError }}
        </span>
        <div class="add-erc20">
          <div class="send">
            <q-btn
              :disable="disableButton"
              label="add"
              color="secondary"
              text-color="info"
              size="md"
              class="add-button"
              @click="validate"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  required,
  alphaNum,
  numeric,
  between,
  minLength,
  maxLength,
} from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import Wallet from '@/store/wallet/entities/wallet';
import Coin from '@/store/wallet/entities/coin';
import tokens from '@/statics/contractMeta/contract-map.json';

export default {
  name: 'AddErc20',
  data() {
    return {
      form: {
        tokenContract: '',
        tokenContractLength: 42,
        tokenName: '',
        tokenSymbol: '',
        tokenSymbolMax: 11,
        tokenDecimals: '',
        tokenDecimalsMax: 36,
        tokenNetwork: {
          label: 'Ethereum',
          value: 'ETHEREUM',
        },
      },
      disableInputs: true,
      loadingInputs: false,
      disableButton: true,
      selected: '',
      searchName: '',
      tokens,
      contractError: '',
      nameError: '',
      symbolError: '',
      decimalsError: '',
    };
  },
  validations() {
    return {
      form: {
        tokenContract: {
          required,
          alphaNum,
          between: (value) => {
            return value.length <= this.form.tokenContractLength
            && value.length >= this.form.tokenContractLength;
          },
          isValidAddress: (value) => { return this.validateAddress(value); },
        },
        tokenName: {
          required,
          alphaNumWithSpaces: (value) => {
            const re = /^[a-zA-Z0-9 ]*$/;
            return re.test(value);
          },
        },
        tokenSymbol: {
          required,
          alphaNum,
          between: minLength(1),
          maxLength: maxLength(this.form.tokenSymbolMax),
        },
        tokenDecimals: {
          required,
          numeric,
          between: between(0, this.form.tokenDecimalsMax),
        },
      },
    };
  },
  computed: {
    ...mapState({
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      delay: (state) => { return state.settings.delay; },
      scannedAddress: (state) => { return state.qrcode.scannedAddress; },

    }),
    supportedCoins() {
      return Coin.all();
    },
    showTestnets() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount).showTestnets;
    },
    demoMode() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount).demoMode;
    },
    supportedNetworks() {
      const networks = Coin.query()
        .where('sdk', 'Ethereum')
        .get();

      if (this.demoMode) {
        return networks.filter(({ testnet }) => { return testnet; }).map((coin) => {
          return {
            label: coin.name,
            value: coin.network,
          };
        });
      }

      if (!this.showTestnets) {
        return networks.filter(({ testnet }) => { return !testnet; }).map((coin) => {
          return {
            label: coin.name,
            value: coin.network,
          };
        });
      }
      return networks.map((coin) => {
        return {
          label: coin.name,
          value: coin.network,
        };
      });
    },
  },
  mounted() {
    if (this.demoMode) {
      this.form.tokenNetwork = {
        label: 'Ethereum Rinkeby',
        value: 'ETHEREUM_RINKEBY',
      };
    }

    if (this.scannedAddress) {
      this.form.tokenContract = this.scannedAddress;
      this.$store.dispatch('qrcode/setScannedAddress', null);
      this.checkField('contract');
    }
  },
  methods: {
    isEthEnabled(network) {
      const result = Wallet.query(network)
        .where('account_id', this.authenticatedAccount)
        .where('name', network)
        .where('enabled', true)
        .get();
      return result.length > 0;
    },

    validateAddress(address) {
      const coinSDK = this.coinSDKS.Ethereum();
      return coinSDK.validateAddress(address, this.form.tokenNetwork.value);
    },

    async validateContract(contract) {
      const coinSDK = this.coinSDKS.ERC20(this.form.tokenNetwork.value);
      try {
        const info = await coinSDK.getTokenData(contract, this.form.tokenNetwork.value);
        if (info) {
          this.form.tokenName = info.name;
          this.form.tokenSymbol = info.symbol;
          this.form.tokenDecimals = info.decimals;
        }
        return true;
      } catch (err) {
        return false;
      }
    },
    async checkContractOnNetworkChange() {
      if (this.form.tokenContract) {
        await this.checkField('contract');
      }
    },
    async checkField(field) {
      if (field === 'contract') {
        this.$v.form.tokenContract.$touch();

        if (!this.$v.form.tokenContract.between) {
          this.disableInputs = true;
          this.disableButton = true;
          this.contractError = this.$t('invalidContractLength');
        } else if (!this.$v.form.tokenContract.isValidAddress) {
          this.contractError = this.$t('invalidContractAddress');
        } else {
          this.loadingInputs = true;
          const valid = await this.validateContract(this.form.tokenContract);
          if (!valid) {
            this.disableInputs = true;
            this.disableButton = true;
            this.loadingInputs = false;
            this.contractError = this.$t('invalidContractAddress');
          } else {
            this.contractError = ' ';
            this.loadingInputs = false;
            this.disableInputs = false;
            this.disableButton = false;
          }
        }
      }
      if (field === 'name') {
        this.$v.form.tokenName.$touch();

        if (!this.$v.form.tokenName.required) {
          this.nameError = this.$t('emptyTokenName');
        } else if (!this.$v.form.tokenName.alphaNumWithSpaces) {
          this.nameError = this.$t('invalidTokenName');
        } else {
          this.nameError = ' ';
        }
      }
      if (field === 'symbol') {
        this.$v.form.tokenSymbol.$touch();
        if (this.$v.form.tokenSymbol.$error) {
          this.symbolError = this.$t('invalidTokenSymbol');
        } else {
          this.symbolError = ' ';
        }
      }
      if (field === 'decimals') {
        this.$v.form.tokenDecimals.$touch();
        if (this.$v.form.tokenDecimals.$error) {
          this.decimalsError = this.$t('invalidTokenDecimals');
        } else {
          this.decimalsError = ' ';
        }
      }
    },
    async validate() {
      this.$v.form.$touch();
      if (!this.$v.form.$error) {
        await this.enableWallet();
      }
    },

    async enableWallet() {
      if (!this.isEthEnabled(this.form.tokenNetwork.label)) {
        const eth = this.supportedCoins.find((coin) => {
          return coin.name === this.form.tokenNetwork.label;
        });

        const wallets = Wallet.query()
          .where('account_id', this.authenticatedAccount)
          .where('name', eth.name)
          .get();

        await Wallet.$update({
          where: wallets[0].id,
          data: { imported: false, enabled: true },
        });
      }

      const isThere = Coin.findToken(this.form.tokenName, this.form.tokenContract);

      if (!isThere) {
        const coin = Coin.query()
          .where('name', this.form.tokenNetwork.label)
          .get()[0];

        const wallet = Wallet.query()
          .where('account_id', this.authenticatedAccount)
          .where('name', this.form.tokenNetwork.label)
          .get();

        const data = {
          name: this.form.tokenName,
          displayName: this.form.tokenName,
          sdk: 'ERC20',
          symbol: this.form.tokenSymbol,
          network: this.form.tokenNetwork.value,
          denomination: '0.00000000',
          parentSdk: 'Ethereum',
          parentName: this.form.tokenNetwork.label,
          contractAddress: this.form.tokenContract,
          decimals: this.form.tokenDecimals,
          testnet: coin.testnet,
          imported: true,
        };
        const newCoin = await Coin.$insert({
          data,
        });
        if (newCoin.coin) {
          const newCoinId = newCoin.coin[0].id;

          await Coin.$update({
            where: newCoinId,
            data: {
              minConfirmations: coin.minConfirmations,
            },
          });
        }


        const keypair = this.coinSDKS.Ethereum(this.form.tokenNetwork.value)
          .generateKeyPair(wallet[0].hdWallet, 0);
        const erc20 = this.coinSDKS.ERC20(this.form.tokenNetwork.value)
          .generateERC20Wallet(
            keypair,
            this.form.tokenName,
            this.form.tokenSymbol,
            this.form.tokenContract,
            this.form.tokenDecimals,
          );

        const newWalletResult = await Wallet.$insert({ data });
        const newWalletId = newWalletResult.wallet[0].id;
        await Wallet.$update({
          where: newWalletId,
          data: {
            account_id: this.authenticatedAccount,
            imported: false,
            enabled: true,
            parentName: 'Ethereum',
            erc20Wallet: erc20,
          },
        });
        this.goBack();
      } else {
        this.$toast.create(10, this.$t('tokenAlreadyEnabled'), this.delay.normal);
        this.clearFields();
      }
    },

    /**
     * Pastes in the text from the clipboard
     */
    paste() {
      try {
        if (window.cordova) {
          cordova.plugins.clipboard.paste((text) => {
            this.form.tokenContract = text;
          });
        } else {
          navigator.clipboard.readText().then((clipText) => {
            this.form.tokenContract = clipText;
          });
        }
      } catch (err) {
        this.errorHandler(err);
      }
    },

    /**
     * Initiates the QR code scanner
     */
    scan() {
      this.$store.dispatch('qrcode/setQRMode', 'addERC20');
      this.$store.dispatch('qrcode/scanQRCode');
      this.$store.dispatch('modals/setAddWalletModalOpened', false);
      this.$store.dispatch('modals/setAddErc20ModalOpened', false);
      const invalidAddress = this.$t('invalidContractAddress');
      if (typeof QRScanner !== 'undefined') {
        setTimeout(() => {
          const scanQR = () => {
            return QRScanner.scan(async (err, text) => {
              if (err) {
                this.errorHandler(err);
              }
              const validAddress = this.validateAddress(text);
              if (validAddress && await this.validateContract(text)) {
                this.$store.dispatch('qrcode/setScannedAddress', text);
                this.$store.dispatch('qrcode/cancelScanning');
              } else {
                this.$toast.create(10, invalidAddress, this.delay.normal);
                const waitForToast = 5000;
                setTimeout(() => { return scanQR(); }, waitForToast);
              }
            });
          };
          scanQR();
        }, this.delay.normal);
      }
    },

    clearFields() {
      Object.keys(this.form).forEach((k) => { this.form[k] = ''; });
    },
    goBack() {
      this.clearFields();
      this.$store.dispatch('modals/setAddErc20ModalOpened', false);
    },
  },
};
</script>

<style>
/* .q-virtual-scroll__content .q-link {
  background: white;
} */
.add-erc20 .send {
  margin-top: 0;
  padding-top: 0;
}
.send-coin-box {
  margin-top: 1rem;
  width: 100%;
}

.to {
  display: flex;
  justify-content: space-between;
}

.to .q-field--with-bottom {
  padding-bottom: 10px;
}

.network-select .q-field {
  width: 100%;
}

.send-coin-box .q-input {
  flex: 1;
}

.amount > div {
  display: flex;
  align-items: center;
}

.sending-wallet-modal {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  font-size: 1.1em;
  line-height: 1;
}

.fee {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
  overflow: hidden;
}

.fee > .label {
  margin-right: 2rem;
}

.fee .q-slider-label {
  padding: 0.3rem 0.5rem;
  text-align: center;
  font-size: 0.8rem;
}

.estimated-fee {
  font-size: 0.8rem;
  text-align: center;
}

.send {
  margin-top: 1rem;
  display: flex;
  padding-top: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.send-modal-heading {
  position: relative;
  margin: .5rem 0 .5rem 0;
  overflow: hidden;
}

.send-modal-heading h3 {
  display: inline-block;
  margin: 0;
  margin-right: 1rem;
}

.send-modal-heading .h3-line {
  width: 100%;
  border-bottom: 1px solid whitesmoke;
  display: inline-block;
  position: absolute;
  top: 50%;
}

.sm-input {
  font-size: 0.7rem;
}

.qr-code-wrapper {
  width: 3rem;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid black;
  position: relative;
  cursor: pointer;
}

.qr-code-wrapper img {
  width: 90%;
  height: 90%;
  position: relative;
  z-index: 2;
}

.side-content {
  width: 3rem;
  margin-left: 0.5rem;
  text-align: center;
}

.amount-div-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.grey-input {
  background: whitesmoke!important;
  box-shadow: none;
  border: 1px solid rgba(0,0,0,0.2);
}

.grey-input input {
  color: #1e3c57!important;
}

.grey-input.q-if-inverted:not(.q-if-inverted-light) .q-input-target::-webkit-input-placeholder {
  color: #afafaf !important;
}

.send-heading-btn {
  border: 1px solid #d4d4d4;
  background: whitesmoke;
  position: absolute;
  right: 0;
  padding: 0;
  width: 3rem;
  height: 0;
  min-height: 1.5rem;
  text-transform: none;
  font-family: Inter-SemiBold!important;
}

.send-heading-btn.active {
  border: 1px solid #de4662;
}

.send-modal-heading .help-icon {
  background: white;
  z-index: 2;
  position: relative;
  top: -0.1rem;
  margin-left: 0.1rem;
  color: #e49ebe;
}

.error-label {
  color: red;
  min-height: 0.5em;
  display: inline-block;
  font-size: 12px;
}
</style>
