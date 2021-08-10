<template>
  <div>
    <h1 class="setup">
      {{ $t('pinConfirmationTitle') }}
    </h1>
    <h4 class="setup">
      {{ $t('confirmPin') }}
    </h4>
    <PinPad
      ref="pinpad"
      mode="pin-confirm"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PinPad from '@/components/Auth/PinPad';

export default {
  name: 'PinConfirm',
  components: {
    PinPad,
  },
  computed: {
    ...mapState({
      pin: (state) => { return state.setup.pinArray; },
      pinConfirm: (state) => { return state.setup.pinConfirmArray; },
      id: (state) => { return parseInt(state.route.params.id, 10); },
      delay: (state) => { return state.settings.delay; },
    }),
  },
  methods: {
    validatePin() {
      if (this.pin.join('') === this.pinConfirm.join('')) {
        this.$router.push({ path: `/setup/${this.id + 1}` });
      } else {
        this.$toast.create(10, this.$t('wrongPin'), this.delay.normal, 'top');
        this.$store.dispatch('setup/resetPinConfirm');
        this.$refs.pinpad.clearPinArray();
      }
    },
  },
};

</script>

<style scoped>

</style>
