<template>
  <div class="setup-wrapper">
    <component :is="steps[id]" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Splash from '@/pages/Setup/Steps/Splash/index.vue';
import AccountName from '@/pages/Setup/Steps/AccountName/index.vue';
import Pin from '@/pages/Setup/Steps/Pin';
import PinConfirm from '@/pages/Setup/Steps/Pin/Confirm';
import Restore from '@/pages/Setup/Steps/Restore';
import Seed from '@/pages/Setup/Steps/Seed';
import SeedConfirm from '@/pages/Setup/Steps/Seed/Confirm';
import Node from '@/pages/Setup/Steps/Node';
import Complete from '@/pages/Setup/Steps/Complete';
import AccountRecovery from '@/pages/Setup/Steps/AccountRecovery/index.vue';

export default {
  components: {
    Splash,
    AccountName,
    AccountRecovery,
    Pin,
    PinConfirm,
    Restore,
    Seed,
    SeedConfirm,
    Node,
    Complete,
  },
  data() {
    return {
      showNext: false,
      steps: [
        Splash,
        Restore,
        Seed,
        SeedConfirm,
        Pin,
        PinConfirm,
        AccountName,
        Complete,
        AccountRecovery,
      ],
    };
  },
  computed: {
    ...mapState({
      id: (state) => { return parseInt(state.route.params.id, 10); },
    }),
  },
  created() {
    if (this.$store.state.setup.salt) { return false; }
    this.$store.dispatch('setup/setSalt', this.$CWCrypto.getSalt());
    return true;
  },
};

</script>

<style>

</style>
