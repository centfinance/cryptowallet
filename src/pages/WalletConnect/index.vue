<template>
  <div>
    <WalletConnect />
  </div>
</template>

<script>
import WalletConnect from '@/components/WalletConnect/WalletConnect';
import { mapState } from 'vuex';

export default {
  name: 'Wallet',
  ...mapState({
    wcRequestPending: (state) => { return state.settings.wcRequestPending; },
  }),
  components: {
    WalletConnect,
  },
  data() {
    return {
      confirm: false,
    };
  },
  computed: {
    wcRequestPending() {
      return this.$store.state.settings.wcRequestPending;
    },
  },
  beforeRouteLeave(to, from, next) {
    if (to.path === '/' && from.path === '/wallet') {
      this.confirm = true;
      next(false);
    } else {
      next();
    }
  },
  methods: {
    exit() {
      navigator.app.exitApp();
    },
  },
};

</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 2.5rem - 4rem  -35px);
  /* height: calc(100vh - 2.5rem - 4rem - 35px - constant(safe-area-inset-top));
  height: calc(100vh - 2.5rem - 4rem - 35px - env(safe-area-inset-top)); */
}

.list {
  flex: 1;
  position: relative;
}
</style>
