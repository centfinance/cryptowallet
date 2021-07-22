<template>
  <div>
    <div
      class="q-mb-sm"
      style="margin-top: -2.5rem"
    >
      <h1 class="setup ">
        {{ $t('welcome') }}
      </h1>
      <div class="text-center q-mt-sm">
        {{ $t('basicSecurityDesc') }}
      </div>
    </div>

    <div class="container q-px-md">
      <div>
        <!-- <div class="q-mb-md q-pl-sm"> -->
        <!-- <div class="text-h6 text-weight-bold">
            {{ $t('basicSecurity') }}
          </div> -->
        <!-- <div class="text-caption">
            {{ $t('basicSecurityDesc') }}
          </div> -->
        <!-- </div> -->
        <!-- <q-list class="q-gutter-y-md"> -->
        <!-- <q-item>
            <q-item-section
              avatar
              top
              class="q-pt-md"
            >
              <q-radio
                v-model="recoveryType"
                val="email"
                color="primary"
              />
            </q-item-section>
            <q-item-section class=" recovery-option q-pa-md"> -->
        <!-- <q-item-label>
                <q-icon name="fas fa-at" />
                {{ $t('emailRecovery') }}
              </q-item-label> -->
        <div class="account-email-input-wrapper">
          <q-input
            ref="emailInput"
            v-model.trim="accountEmail"
            type="email"
            outlined
            color="primary"
            :placeholder="$t('emailPlaceholder')"
            @keydown.enter.prevent="validate"
          />
        </div>
        <!-- </q-item-section>
          </q-item> -->
        <!-- <q-item>
            <q-item-section
              avatar
              top
              class="q-pt-md"
            >
              <q-radio
                v-model="recoveryType"
                dark
                class="sms"
                val="sms"
                color="primary"
              />
            </q-item-section>
            <q-item-section class="recovery-option q-pa-md">
              <q-item-label>
                <q-icon name="fas fa-mobile-alt" />
                {{ $t('smsRecovery') }}
              </q-item-label>
            </q-item-section>
          </q-item> -->
        <!-- </q-list> -->
      </div>
      <!-- <div class="q-mt-xl">
        <div class="q-mb-md q-pl-sm">
          <div class="text-h6 text-weight-bold">
            {{ $t('advancedSecurity') }}
          </div>
          <div class="text-caption">
            {{ $t('advancedSecurityDesc') }}
          </div>
        </div>
        <q-list>
          <q-item>
            <q-item-section
              avatar
              top
            >
              <q-radio
                v-model="recoveryType"
                class="recoveryPhrase"
                val="recoveryPhrase"
                color="primary"
              />
            </q-item-section>
            <q-item-section class=" recovery-option q-pa-md">
              <q-item-label>
                <q-icon name="far fa-list-alt" />

                {{ $t('recoveryPhrase') }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div> -->

      <!-- <div class="account-name-input-wrapper">
      <q-input
        v-model.trim="accountEmail"
        outlined
        dark
        color="primary"
        placeholder="email@example.com"
      />
    </div> -->
      <div class="btns-wrapper q-mt-lg">
        <q-btn
          color="secondary"
          text-color="info"
          :label="$t('next')"
          @click="validate"
        />
      </div>
    </div>
    <q-inner-loading :showing="visible">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>
    <q-dialog
      v-model="demoMode"
      persistent
    >
      <q-card>
        <q-card-section>
          <div class="text-h6">
            Enter the demo mode password
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model.trim="password"
            autofocus
            outlined
            dense
            float-label="Enter password"
            color="primary"
            type="password"
            :error="passwordError"
            :error-message="passwordErrorMessage"
            @keydown.enter.prevent="useDemoMode"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            label="Cancel"
            color="info"
          />
          <q-btn
            flat
            label="Enter"
            color="info"
            @click="useDemoMode"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  required,
  email,
} from 'vuelidate/lib/validators';
import directAuth from '@/helpers/DirectAuth';

export default {
  name: 'AccountRecovery',
  data() {
    return {
      accountEmail: '',
      accountSms: '',
      recoveryType: 'email',
      visible: false,
      demoMode: false,
      password: '',
      passwordError: false,
      passwordErrorMessage: 'Wrong password',
    };
  },
  validations: {
    accountEmail: {
      required,
      email,
    },
  },
  computed: {
    ...mapState({
      delay: (state) => { return state.settings.delay; },
    }),
  },
  methods: {
    async validate() {
      this.$refs.emailInput.blur();
      if (this.recoveryType === 'recoveryPhrase') {
        this.$router.push({ path: '/setup/2' });
        return true;
      }

      if (this.recoveryType === 'sms') {
        await this.validateSMS();
        return true;
      }

      if (!this.$v.accountEmail.required) {
        this.$toast.create(10, this.$t('enterAccountEmail'), this.delay.normal, 'top');
        return false;
      }

      if (!this.$v.accountEmail.email) {
        this.$toast.create(10, this.$t('invalidAccountEmail'), this.delay.normal, 'top');
        return false;
      }

      if (this.accountEmail === 'demo@cent.finance') {
        this.demoMode = true;
        return true;
      }

      if (this.$magic.isLoggedIn()) {
        this.$magic.logout();
      }

      this.visible = true;
      const login = await this.$magic.login(this.accountEmail);
      if (login) {
        const mnemonic = await this.$magic.getMnemonic();
        const mnemonicArray = mnemonic.split(' ');
        this.$store.dispatch('setup/setAccountEmail', this.accountEmail);
        this.$store.dispatch('setup/setSeed', mnemonicArray);
        console.log(`mnemonic ${mnemonicArray}`);
        console.log(`mnemonic ${JSON.stringify(mnemonic)}`);
        this.$store.dispatch('setup/setSeedString', mnemonic);
        this.$router.push({ path: '/setup/4' });
        this.visible = false;
      }

      return true;
    },

    async validateSMS() {
      this.visible = true;
      const user = await directAuth.login();
      if (user) {
        const mnemonic = directAuth.getMnemonic(user.privateKey);
        const mnemonicArray = mnemonic.split(' ');
        this.$store.dispatch('setup/setSeed', mnemonicArray);
        this.$store.dispatch('setup/setSeedString', mnemonic);
        this.$router.push({ path: '/setup/4' });
      }
      this.visible = false;
    },

    useDemoMode() {
      this.passwordError = false;
      if (this.password !== 'cent') {
        this.passwordError = true;
        return false;
      }

      this.$store.dispatch('setup/setDemoMode', true);
      this.$router.push({ path: '/setup/4' });
      this.demoMode = false;
      this.visible = false;
      return true;
    },
  },
};

</script>

<style scoped>
.account-email-input-wrapper {
  margin-top: 1rem;
  padding: 0 1em 0, 0;
}
.recovery-option {
  border: 1px solid lightgrey;
  border-radius: 5px;
}
</style>
