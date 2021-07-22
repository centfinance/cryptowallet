<template>
  <div
    class="q-pa-md"
    style="padding:2px; width:98%;max-width:100%"
  >
    <q-list
      bordered
      separator
      striped
      style="padding:2px;"
    >
      <q-item>
        <q-item-section>
          <q-item-label overline>
            From:
          </q-item-label>
          <q-item-label caption>
            {{ payLoad.from }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            To:
          </q-item-label>
          <q-item-label caption>
            {{ payLoad.to }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            Gas Limit:
          </q-item-label>
          <q-item-label caption>
            {{ payLoad.gasLimit }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            Gas Price:
          </q-item-label>
          <q-item-label caption>
            {{ payLoad.gasPrice }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            Nonce:
          </q-item-label>
          <q-item-label caption>
            {{ payLoad.nonce }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            Value:
          </q-item-label>
          <q-item-label caption>
            {{ payLoad.value }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section style="overflow-wrap: anywhere;">
          <q-item-label overline>
            Data:
          </q-item-label>
          <q-item-label caption>
            {{ payLoad.data }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
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
    signTransactionModalOpened: {
      get() {
        // this.openWalletConnect();
        return this.$store.state.modals.signTransactionModalOpened;
      },
      set(value) {
        this.$store.dispatch('modals/signTransactionModalOpened', value);
      },
    },
  },
  methods: {
    closeModal() {
      this.signTransactionModalOpened = false;
    },
  },
};
</script>
