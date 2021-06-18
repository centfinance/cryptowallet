<template>
  <div class="container splash">
    <div
      class="splash-logo  text-center"
    >
      <img
        v-if="dark || currentWalletType!==null"
        class="logo-loading"
        src="~/assets/cent-logo-white.svg"
      >
      <img
        v-else
        class="logo-loading"
        src="~/assets/cent-logo-black.svg"
      >
      <p class="splash-slogan">
        {{ $t('splashSlogan') }}
      </p>
    </div>
    <br>
    <div
      class="splash-logo fixed-bottom q-ma-lg text-center"
    >
      <p>
        <br><br><span v-if="currentWalletType!==null">
          Let's start by selecting the below option</span>
      </p>
      <div
        class="quick-coin-actions"
      >
        <div class="q-pa-md float q-gutter-sm">
          <q-btn
            v-if="currentWalletType ==='ether'
              || walletType==='ether'
              || currentWalletType===null
              && walletType===''"
            @click="setWalletType('ether')"
          >
            <q-avatar
              square
              size="100px"
            >
              <img src="~/assets/icons/ethereum.svg">
            </q-avatar>
          </q-btn>
          <q-btn
            v-if="currentWalletType ==='celo'
              || walletType==='celo'
              || currentWalletType===null
              && walletType===''"
            @click="setWalletType('celo')"
          >
            <q-avatar
              square
              size="100px"
            >
              <img src="~/assets/icons/celo.svg">
            </q-avatar>
          </q-btn>
          <div
            v-if="walletType"
            class="float"
          >
            <q-btn
              v-if="walletType!='celo'"
              :label="$t('getStarted')"
              unelevated
              icon="mail"
              color="primary"
              text-color="white"
              class="q-ma-sm"
              @click="getStarted"
            /><p v-if="walletType!=='celo'">
              Advanced
            </p>
            <q-btn
              :label="$t('seedPhraseCreate')"
              unelevated
              color="primary"
              text-color="white"
              class="q-ma-sm"
              @click="seedPhrase"
            />
            <q-btn
              :label="$t('seedPhraseImport')"
              unelevated
              color="primary"
              text-color="white"
              class="q-ma-sm"
              @click="importAccount"
            />
          </div>
          <q-btn
            v-if="walletType"
            :label="$t('cancel')"
            unelevated
            color="secondary"
            text-color="white"
            class="q-ma-sm"
            @click="setWalletType('')"
          />
        </div>
      </div>
    </div>

    <br>
    <q-btn
      v-if="currentWalletType!==null"
      icon="arrow_back"
      size="lg"
      color="primary"
      class="icon-btn back-arrow-btn"
      flat
      @click.prevent="goBack"
    />
    <!-- <div class="advanced-dropdown q-mt-sm">
      <q-expansion-item
        label="Advanced"
        color="info"
      >
        <q-btn
          :label="$t('seedPhraseCreate')"
          flat
          no-caps
          dense
          class="import-account-btn"
          text-color="blue"
          size="13px"
          @click="seedPhraseCreate()"
        />
        <q-btn
          :label="$t('seedPhraseImport')"
          flat
          no-caps
          dense
          class="import-account-btn"
          text-color="blue"
          size="13px"
          @click="importAccount()"
        />
      </q-expansion-item>
    </div> -->
    <!-- <div class="btns-wrapper">
      <q-btn
        :label="$t('importAccount')"
        flat
        icon="get_app"
        color="blueish"
        class="splash-btn import-account-btn"
        text-color="primary"
        @click="importAccount()"
      />
    </div> -->
    <!-- <div class="flags">
      <div class="row q-input bg-blueish">
        <div class="col-2 flag-icon">
          <img
            :src="selectedLang.icon"
            class="select-icon"
          >
        </div>
        <div class="col-10 input-field">
          <v-select
            v-model="selectedLang"
            :options="languageArray"
            :searchable="false"
            :clear-search-on-select="false"
            :filterable="false"
            class="lang-select"
            label="label"
          >
            <template
              slot="option"
              slot-scope="option"
            >
              <div class="row">
                <div class="col-2">
                  <img
                    :src="option.icon"
                    class="input-icon"
                  >
                </div>
                <div class="label col-10">
                  {{ option.label }}
                </div>
              </div>
            </template>
          </v-select>
        </div>
      </div>
    </div> -->

    <!-- <div
      :class="{ emphasised: emphasised }"
      class="loading-footer"
    >
      <img
        class="logo-loading"
        src="~/assets/logo-white-horizontal.png"
      >
    </div> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      locale: this.$i18n.locale,
      $i18n: '',
      walletType: '',
      selectedLang: {
        label: 'English',
        value: 'en-gb',
        icon: './statics/flags/en-gb.svg',
      },
    };
  },

  computed: {
    ...mapState({
      id: (state) => { return parseInt(state.route.params.id, 10); },
      currentWalletType: (state) => {
        return state.settings.walletType;
      },
    }),

    emphasised() {
      if (this.$route.path === '/setup/0') {
        return true;
      }
      return false;
    },

    supportedLanguages() {
      return Object.keys(this.$i18n.messages).map((key) => { return key; });
    },

    languageArray() {
      return this.supportedLanguages.map((lang) => {
        return {
          label: this.$t(lang),
          value: lang,
          icon: `./statics/flags/${lang}.svg`,
        };
      });
    },

    dark() {
      return this.$q.dark.isActive;
    },
  },

  mounted() {
    this.$store.dispatch('setup/setAccountLocale', this.selectedLang.value);
  },

  methods: {
    importAccount() {
      this.$i18n.locale = this.selectedLang.value;
      this.$store.dispatch('setup/setAccountLocale', this.selectedLang.value);
      this.$store.dispatch('setup/setAccountCurrency', this.$t('supportedCurrency'));
      this.$store.dispatch('setup/setAccountType', 'restored');
      this.$router.push({ path: `/setup/${this.id + 1}` });
      return true;
    },
    goBack() {
      this.$router.go(-1);
    },
    setWalletType(walletType) {
      this.walletType = walletType;
      this.$store.dispatch('setup/setWalletType', walletType);
    },
    getStarted() {
      this.$store.dispatch('setup/setAccountLocale', this.selectedLang.value);
      this.$store.dispatch('setup/setAccountCurrency', this.$t('supportedCurrency'));
      this.$store.dispatch('setup/setAccountType', 'new');
      this.$router.push({ path: '/setup/8' });
    },

    seedPhrase() {
      this.$store.dispatch('setup/setAccountLocale', this.selectedLang.value);
      this.$store.dispatch('setup/setAccountCurrency', this.$t('supportedCurrency'));
      this.$store.dispatch('setup/setAccountType', 'new');
      this.$router.push({ path: '/setup/2' });
    },
  },
};

</script>

<style>

.advanced-dropdown .q-expansion-item__container {
  position: absolute;
  left: 50%;
  transform: translate(-50%);
}

.advanced-dropdown .q-item {
  justify-content: center;
  min-height: 0px;
}

.advanced-dropdown .q-item__section--main {
  flex: none;
}

.advanced-dropdown .q-item__section--main ~ .q-item__section--side {
  padding-left: 2px;
}

.import-account-btn {
  width: 15rem;
}

.done-msg-wrapper {
  text-align: center;
  font-family: 'CooperHewitt-HeavyItalic';
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
  margin-bottom: 2em;
}

.done-msg-wrapper h1 {
  font-size: xx-large;
  letter-spacing: 0.1em;
  line-height: initial;
}

.hollow-text {
  -webkit-text-stroke: 1px white;
  -webkit-text-fill-color: rgb(47, 59, 82);
}

.flags {
  display: flex;
  justify-content: space-around;
  max-width: 80%;
  margin: 1em auto 2em auto;
}

.flag-wrapper {
  text-align: center;
}

.flag_icon {
  height: 60px;
  width: 60px;
}

.lang-select {
  min-width: 40vw;
  padding-bottom: 3px;
}

.lang-select .selected-tag {
  color:white;
  padding-left: 10px;
}

.lang-select .dropdown-toggle {
    border:none;
}

.lang-select .dropdown-toggle .clear {
  border:none;
  display:none;
}

.input-icon {
  width: 1.5em;
  margin-left: -5px;
}

.select-icon {
  width: 1.5em;
  margin-left: 15px;
  margin-top: 5px;
}

.lang-select .dropdown-menu {
  background-color: darkslategrey;
  color: white;
  width: 125%;
  margin-left: -21%;
}

.lang-select .label {
  color: white;
  padding-left: 0.3em;
  padding-top: 0.19em;
}

.lang-select .open-indicator:before {
  border-color: white;
}

.lang-select .form-control {
  display: none;
}

.flag-icon {
  padding-top: 2px;
}

.input-field {
  padding-top: 3px;
  padding-right: 5px;
}

.splash-btn {
  width: 15rem;
  height: 3rem;
}

.splash-logo h1 {
  font-family: 'CooperHewitt-BoldItalic';
  letter-spacing: normal;
  text-align: center;
  margin: 0;
  font-size: 2.5rem;
}

.splash-logo p {
  font-family: CooperHewitt-Semibold;
  opacity: 0.9;
  margin-top: 0.5rem;
  margin-bottom: 0rem;
  font-size: 0.9rem;
  text-align: center;
}

.splash-logo {
  margin-bottom: 2rem;
}

.splash .btns-wrapper {
  margin-top: 0.5rem;
}

.splash-slogan {
  padding: 0 0.5rem;
}

</style>
