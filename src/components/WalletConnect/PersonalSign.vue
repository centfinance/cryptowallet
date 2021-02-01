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
      <q-item
        v-ripple
        clickable
      >
        <q-item-section>
          <q-item-label overline>
            <strong>Address:</strong>
          </q-item-label>
          <q-item-label>{{ payLoad.address }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        v-ripple
        clickable
      >
        <q-item-section>
          <q-item-label overline>
            Message:
          </q-item-label>
          <q-item-label>{{ payLoad.message }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
<script>

export default {
  name: 'SignTransaction',
  props: {
    payLoad: {
      type: Object,
      required: true,
    },
  },
  computed: {
  },
  methods: {
  },
};
</script>
