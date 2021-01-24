<template>
  <div>
    <div class="send-coin-box">
      <!-- <span class="error-label error-label-address">
        {{ addressError }}
      </span> -->
      <div class="amount">
        <div
          class="amount-div-wrapper"
        >
          <div class="side-content">
            Address
          </div>
          <q-input
            v-model="payLoad.address"
            readonly
            class="sm-input amount-in-currency"
            outlined
            dense
            color="primary"
          />
        </div>
        <div class="amount-div-wrapper">
          <div class="side-content">
            Message
          </div>
          <q-input
            v-model="payLoad.message"
            readonly
            class="sm-input amount-in-currency"
            outlined
            dense
            color="primary"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
// import Utxo from '@/store/wallet/entities/utxo';
// import networks from '@/store/settings/state/supportedNetworks';

export default {
  name: 'SignTransaction',
  props: {
    payLoad: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
      // id: (state) => { return state.route.params.id; },
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
    }),
  },
  methods: {
  },
};
</script>
