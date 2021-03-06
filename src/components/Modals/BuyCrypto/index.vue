<template>
  <div v-if="buyCryptoModalOpened">
    <div
      v-if="showCloseProvider"
      class="close-provider"
    >
      <q-btn
        icon="close"
        color="info"
        size="lg"
        class="icon-btn icon-btn-right absolute"
        flat
        @click="closeProvider"
      />
    </div>
    <q-dialog
      v-model="buyCryptoModalOpened"
      :maximized="true"
      transition-show="slide-up"
      transition-hide="slide-down"
      content-class="light-modal"
    >
      <BuyCryptoContent
        @loading="loading"
        @setProvider="setPaymentProvider"
      />
    </q-dialog>

    <q-inner-loading
      :showing="paymentLoading.on"
    >
      <q-circular-progress
        show-value
        indeterminate
        size="200px"
        :thickness="0.07"
        color="primary"
        track-color="grey-3"
        class="q-ma-md"
      >
        <img
          class="loading-logo"
          :src="paymentLoading.logo"
        >
      </q-circular-progress>
      <div class="row text-center text-info q-pa-lg text-weight-bold">
        You are now being transferred to our trusted partner...
      </div>
    </q-inner-loading>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BuyCryptoContent from './BuyCryptoContent';

export default {
  name: 'BuyCrypto',
  components: {
    BuyCryptoContent,
  },
  data() {
    return {
      // transak: null,
      visible: false,
      loadingLogo: 'null',
      provider: null,
    };
  },
  computed: {
    ...mapState({
      paymentLoading: (state) => { return state.settings.paymentLoading; },
    }),
    buyCryptoModalOpened: {
      get() {
        return this.$store.state.modals.buyCryptoModalOpened;
      },
      set(value) {
        this.$store.dispatch('modals/setBuyCryptoModalOpened', value);
      },
    },

    showCloseProvider() {
      if (this.provider && this.provider.isInitialised) {
        return true;
      }
      return false;
    },
  },
  watch: {
    $route: {
      handler(to) {
        if (to.name === 'buyCrypto' || to.name === 'buyCryptoSingle') {
          this.$store.dispatch('modals/setBuyCryptoModalOpened', true);
        } else if ((to.name === 'wallet' || to.name === 'walletSingle')) {
          this.$store.dispatch('modals/setBuyCryptoModalOpened', false);
        }
      },
    },
    buyCryptoModalOpened: {
      handler(newVal, oldVal) {
        if (oldVal === true && newVal === false) {
          if (this.$store.state.route.name === 'buyCrypto' || this.$store.state.route.name === 'buyCryptoSingle') { this.$router.go(-1); }
        }
      },
    },
  },
  methods: {
    loading(val) {
      this.loadingLogo = val.logo;
      this.visible = val.on;
    },

    setPaymentProvider(val) {
      this.provider = val;
    },

    closeProvider() {
      if (this.provider) { this.provider.closeRequest(); }
    },
  },
};
</script>

<style lang="styl" scoped>
.q-inner-loading {
  z-index: 999;
  background: white;
}

.body--dark .q-inner-loading {
  background: $dark;
}

.close-provider {
  position: absolute;
  z-index: 999;
  top: 45px;
  right: 2px;
}

body.desktop .close-provider  {
    display: none;
}

.loading-logo {
  width: 100%;
  padding: 30px;
}


</style>
