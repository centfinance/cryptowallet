<template>
  <div>
    <h1 class="setup">
      {{ $t("nodeTitle") }}
    </h1>
    <p class="setup">
      {{ $t("nodeSubtitle") }}
    </p>

    <div class="ip-input">
      <q-input
        v-model="nodeIp"
        :float-label="$t('IPAddress')"
        outlined
        dark
        color="primary"
      />
    </div>

    <div class="btns-wrapper">
      <q-btn
        color="secondary"
        label="Skip"
        @click="skip"
      />

      <q-btn
        color="yellow"
        text-color="blueish"
        label="Done"
        @click="done"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      nodeIp: null,
    };
  },
  computed: {
    ...mapState({
      id: (state) => { return parseInt(state.route.params.id, 10); },
      delay: (state) => { return state.settings.delay; },
    }),
  },
  methods: {
    validIp(ip) {
      if (ip === 'HTTP://127.0.0.1:7545') {
      // eslint-disable-next-line max-len
      // if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
        return true;
      }
      return false;
    },

    done() {
      if (this.validIp(this.nodeIp)) {
        this.$router.push({ path: `/setup/${this.id + 1}` });
      } else {
        this.$toast.create(10, this.$t('invalidIpAddress'), this.delay.normal);
      }
    },

    skip() {
      this.$router.push({ path: `/setup/${this.id + 1}` });
    },
  },

};

</script>

<style>
.ip-input {
  margin-top: 1em;
  padding: 0 1em;
}
</style>
