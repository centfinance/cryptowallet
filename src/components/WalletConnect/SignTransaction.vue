<template>
  <div
    class="q-pa-md"
    style="padding:2px;"
  >
    <q-list
      bordered
      separator
      style="padding:2px;"
    >
      <q-item>
        <q-item-section>
          <q-item-label overline>
            From:
          </q-item-label>
          <q-item-label>{{ payLoad.from }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            To:
          </q-item-label>
          <q-item-label>{{ payLoad.to }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            Gas Limit:
          </q-item-label>
          <q-item-label>{{ payLoad.gasLimit }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            Gas Price:
          </q-item-label>
          <q-item-label>{{ payLoad.gasPrice }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            Nonce:
          </q-item-label>
          <q-item-label>{{ payLoad.nonce }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            Value:
          </q-item-label>
          <q-item-label>{{ payLoad.value }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            Data:
          </q-item-label>
          <q-item-label>{{ payLoad.data }}</q-item-label>
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
  },
  methods: {

  },
};
</script>
