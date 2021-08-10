<template>
  <q-dialog
    v-model="newPinModalOpened"
    :maximized="true"
    transition-show="slide-up"
    transition-hide="slide-down"
    content-class="dark-modal"
  >
    <div>
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
        <h1 class="header-h1">
          {{ $t('pinCode') }}
        </h1>
      </div>

      <div class="modal-layout-wrapper center">
        <h1 class="setup with-margin">
          <span v-if="!authorized">{{ $t('enterPin') }}</span>
          <span v-if="authorized && !newPinConfirmed">{{ $t('enterNewPin') }}</span>
          <span v-if="authorized && newPinConfirmed">{{ $t('repeatNewPin') }}</span>
        </h1>

        <PinPad
          ref="PinPad"
          :mode="mode"
          @inputPin="pinInputListener"
          @attemptUnlock="attemptUnlock"
          @resetPin="resetPin"
          @newPinSet="storeNewPin"
          @attemptConfirm="updateAccount"
        />
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { mapState } from 'vuex';
import AES from 'crypto-js/aes';
import encUTF8 from 'crypto-js/enc-utf8';
import Account from '@/store/wallet/entities/account';
import Wallet from '@/store/wallet/entities/wallet';
import PinPad from '@/components/Auth/PinPad';

export default {
  name: 'Pin',
  components: {
    PinPad,
  },
  props: {
    pinHash: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      pin: [],
      oldPin: null,
      newPin: null,
      authorized: false,
      newPinConfirmed: false,
      newPinHash: null,
      salt: null,
      mode: 'access',
    };
  },
  computed: {
    ...mapState({
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      delay: (state) => { return state.settings.delay; },
    }),
    account() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount);
    },
    newPinModalOpened: {
      get() {
        return this.$store.state.modals.newPinModalOpened;
      },
      set(value) {
        this.$store.dispatch('modals/setNewPinModalOpened', value);
      },
    },
  },
  methods: {
    /**
     * Decrypts and returns a piece of data
     * @param  {Uint8Array} data
     * @param  {String} password
     * @return {Any}
     */
    decrypt(data, password) {
      const bytes = AES.decrypt(data, password);
      return JSON.parse(bytes.toString(encUTF8));
    },

    resetPin() {
      this.pin = [];
    },
    /**
     * Adds or removes pin input event to pin arr.
     */
    pinInputListener(pin) {
      this.pin.push(pin);
    },
    /**
     * Compares bcrypt pin string to try and unlock an account
     */
    attemptUnlock() {
      if (this.$CWCrypto.bcryptCompareString(this.pin.join(''), this.account.pinHash) === true) {
        this.oldPin = this.pin;
        this.authorized = true;
        this.$refs.PinPad.resetState();
        this.resetPin();
        this.mode = 'new-pin';
      } else {
        this.$toast.create(10, this.$t('wrongPin'), this.delay.normal, 'top');
        this.$refs.PinPad.resetState();
        this.resetPin();
      }
    },
    /**
     * Closes the modal and resets the state
     */
    closeModal() {
      this.authorized = false;
      this.$refs.PinPad.resetState();
      this.resetPin();
      Object.assign(this.$data, this.$options.data.apply(this));
      this.newPinModalOpened = false;
    },

    /**
     * Gets the salt
     * @return {String}
     */
    getSalt() {
      if (this.salt) { return this.salt; }
      this.salt = this.$CWCrypto.getSalt();
      return this.salt;
    },

    /**
     * Generates new PIN hash
     */
    storeNewPin() {
      this.newPin = this.pin;
      this.newPinHash = this.$CWCrypto.bcryptHashString(this.pin.join(''), this.getSalt());
      this.newPinConfirmed = true;
      this.$refs.PinPad.resetState();
      this.resetPin();
      this.mode = 'confirm-new-pin';
    },

    /**
     * Encrypts sensitive data with the new pin
     */
    async encryptPersistentData() {
      const wallets = Wallet.query().where('account_id', this.authenticatedAccount).get();

      wallets.forEach((wallet) => {
        Wallet.AES.forEach((property) => {
          const data = {};
          data[property] = wallet[property];

          Wallet.$update({
            data,
            where: wallet.id,
            password: this.newPin.join(''),
          });
        });
      });

      const account = Account.query().where('id', this.authenticatedAccount).get();
      const data = {
        pinHash: this.newPinHash,
        refresh_token: this.decrypt(account[0].refresh_token, this.oldPin.join('')),
        seed: account[0].seed,
        salt: this.salt,
      };

      Account.$update({
        data,
        where: this.authenticatedAccount,
        password: this.newPin.join(''),
      });
    },

    /**
     * If new PIN confirmed correctly updates the account
     */
    async updateAccount() {
      if (this.$CWCrypto.bcryptCompareString(this.pin.join(''), this.newPinHash)) {
        await this.encryptPersistentData();
        this.$toast.create(0, this.$t('pinChanged'), this.delay.normal);
        this.$refs.PinPad.resetState();
        this.resetPin();
        this.closeModal();
      } else {
        this.$toast.create(10, this.$t('wrongPin'), this.delay.normal, 'top');
        this.$refs.PinPad.resetState();
        this.resetPin();
      }
    },
  },
};
</script>

<style>
.setup.with-margin {
  margin: 2rem auto;
  margin-bottom: 1rem;
}
</style>
