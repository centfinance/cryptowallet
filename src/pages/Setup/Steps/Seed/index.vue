<template>
  <div class="fixed-bottom q-ma-lg">
    <h1 class="setup">
      {{ $t('seedPhrase') }}
    </h1>
    <p class="setup">
      {{ $t('writeSeed') }}
    </p>
    <h4 class="setup seed-box">
      <span
        v-for="(word, i) in seedPhrase"
        :key="`word${i}`"
        class="word-span"
      >
        <span class="word-index">{{ i + 1 }}.</span>
        {{ word }}
      </span>
    </h4>

    <div class="btns-wrapper">
      <q-btn
        flat
        color="info"
        label="Try Different Seed"
        @click="anotherSeed"
      />

      <q-btn
        color="secondary"
        text-color="info"
        label="Done"
        @click="confirmed"
      />
    </div>

    <q-dialog
      v-model="confirm"
      persistent
    >
      <q-card
        style="width: 300px"
        class="dialog"
      >
        <q-card-section>
          <h2>{{ $t('confirm') }}</h2>
          <p class="">
            {{ $t('seedConfirmation') }}
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="$t('cancelConfirm')"
            color="info"
          />
          <q-btn
            flat
            :label="$t('acceptConfirm')"
            color="info"
            @click="done"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import bip39 from 'bip39';
import { mapState } from 'vuex';

export default {
  data() {
    return {
      generateble: true,
      seedPhrase: [],
      valid: false,
      confirm: false,
    };
  },
  computed: {
    ...mapState({
      id: (state) => { return parseInt(state.route.params.id, 10); },
    }),
  },
  mounted() {
    this.generateSeed();
    if (window.cordova) {
      window.plugins.preventscreenshot.disable(() => {}, () => {});
    }
  },
  methods: {
    generateSeed() {
      const mnemonic = bip39.generateMnemonic();
      this.seedPhrase = mnemonic.split(' ');
      this.seedPhrase = bip39.generateMnemonic().split(' ');
      this.seedPhrase = this.seedPhrase.filter((word, index) => {
        return this.seedPhrase.indexOf(word) === index;
      });
      const expectedSeedLength = 12;
      if (this.seedPhrase.length === expectedSeedLength) {
        this.$store.dispatch('setup/setSeed', this.seedPhrase);
        this.$store.dispatch('setup/setSeedString', mnemonic);
      } else {
        this.anotherSeed();
      }
    },
    confirmed() {
      this.confirm = true;
    },
    done() {
      this.confirm = false;
      this.$router.push({ path: `/setup/${this.id + 1}` });
    },
    anotherSeed() {
      this.generateSeed();
    },
  },
};
</script>

<style scoped>
.seed-box {
  padding: 1em 0;
  line-height: 2;
  font-size: 1.2rem;
}
.word-span {
  margin: 0 .5em;
  display: inline-block;
}
.word-index {
  opacity: 0.3;
  white-space: nowrap;
  font-size: 0.75em;
}
</style>
