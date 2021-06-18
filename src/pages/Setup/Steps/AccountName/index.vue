<template>
  <div class="container fixed-center">
    <div>
      <h1 class="setup">
        {{ $t('setAccountName') }}
      </h1>
    </div>
    <div class="account-name-input-wrapper">
      <q-input
        v-model.trim="accountName"
        :float-label="$t('accountName')"
        outlined
        color="primary"
        @keydown.enter.prevent="validate"
      />
    </div>
    <div class="btns-wrapper">
      <q-btn
        color="secondary"
        text-color="info"
        label="Next"
        @click="validate"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  required,
  alphaNum,
} from 'vuelidate/lib/validators';

export default {
  name: 'AccountName',
  data() {
    return {
      accountName: '',
      maxNameLength: 50,
    };
  },
  validations: {
    accountName: {
      required,
      alphaNum,
    },
  },
  computed: {
    ...mapState({
      delay: (state) => { return state.settings.delay; },
    }),
  },
  methods: {
    validate() {
      if (!this.$v.accountName.required) {
        this.$toast.create(10, this.$t('enterAccountName'), this.delay.normal, 'top');
        return false;
      }

      if (!this.$v.accountName.alphaNum) {
        this.$toast.create(10, this.$t('invalidAccountName'), this.delay.normal, 'top');
        return false;
      }

      if (this.accountName.length > this.maxNameLength) {
        this.$toast.create(10, this.$t('invalidAccountLength'), this.delay.normal, 'top');
        return false;
      }

      const accounts = this.$store.getters['entities/account/query']().get();
      const nameAlreadyInUse = accounts.find((account) => {
        return account.name === this.accountName;
      });

      if (nameAlreadyInUse) {
        this.$toast.create(10, this.$t('accountNameTaken'), this.delay.normal);
        return false;
      }

      this.$store.dispatch('setup/setAccountName', this.accountName);
      this.$router.push({ path: '/setup/7' });
      return true;
    },
  },
};

</script>

<style scoped>
.account-name-input-wrapper {
  margin-top: 1rem;
  padding: 0 1em;
}
</style>
