<template>
  <div
    class="settings-row"
  >
    <div>
      Connect to Test Networks?
    </div>
    <div>
      <q-toggle
        v-model="allowTestMode"
        color="primary"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Account from '@/store/wallet/entities/account';

export default {
  name: 'ToggleTestMode',

  computed: {
    ...mapState({
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
    }),
    allowTestMode: {
      get() {
        return this.$store.getters['entities/account/find'](this.authenticatedAccount).testMode;
      },
      set(val) {
        Account.$update({
          where: this.authenticatedAccount,
          data: {
            testMode: val,
          },
        });
      },
    },
  },
};
</script>

<style>

</style>
