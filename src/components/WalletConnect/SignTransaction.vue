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
            From
          </div>
          <q-input
            v-model="payLoad.from"
            readonly
            class="sm-input amount-in-currency"
            outlined
            dense
            color="primary"
          />
        </div>
        <div class="amount-div-wrapper">
          <div class="side-content">
            To
          </div>
          <q-input
            v-model="payLoad.to"
            readonly
            class="sm-input amount-in-currency"
            outlined
            dense
            color="primary"
          />
        </div>
        <div class="amount-div-wrapper">
          <div class="side-content">
            Gas Limit
          </div>
          <q-input
            v-model="payLoad.gasLimit"
            readonly
            class="sm-input amount-in-currency"
            outlined
            dense
            color="primary"
          />
        </div>
        <div class="amount-div-wrapper">
          <div class="side-content">
            Gas Price
          </div>
          <q-input
            v-model="payLoad.gasPrice"
            readonly
            class="sm-input amount-in-currency"
            outlined
            dense
            color="primary"
          />
        </div>
        <div class="amount-div-wrapper">
          <div class="side-content">
            Nonce
          </div>
          <q-input
            v-model="payLoad.nonce"
            readonly
            class="sm-input amount-in-currency"
            outlined
            dense
            color="primary"
          />
        </div>
        <div class="amount-div-wrapper">
          <div class="side-content">
            Value
          </div>
          <q-input
            v-model="payLoad.value"
            readonly
            class="sm-input amount-in-currency"
            outlined
            dense
            color="primary"
          />
        </div>
        <div class="amount-div-wrapper">
          <div class="side-content">
            Data
          </div>
          <q-input
            v-model="payLoad.data"
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
    wallet: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
      // id: (state) => { return state.route.params.id; },
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      delay: (state) => { return state.settings.delay; },
      scannedAddress: (state) => { return state.qrcode.scannedAddress; },
      scannedAmount: (state) => { return state.qrcode.scannedAmount; },

    }),
  },
  methods: {

  },
};
</script>
