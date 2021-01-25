<template>
  <div>
    <div class="send-coin-box">
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
    }),
  },
  methods: {

  },
};
</script>
