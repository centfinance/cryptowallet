<template>
  <q-dialog
    v-model="exportKeysModalOpened"
    :maximized="true"
    transition-show="slide-up"
    transition-hide="slide-down"
    content-class="dark-modal"
  >
    <div v-if="token">
      <div class="header-section">
        <div class="header-back-button-wrapper">
          <q-btn
            icon="arrow_back"
            size="lg"
            class="icon-btn back-arrow-btn"
            flat
            @click.prevent="() => exportKeysModalOpened = false"
          />
        </div>
        <h1 class="header-h1">
          View Private Keys
        </h1>
      </div>
      <div class="q-pa-lg modal-layout-wrapper">
        <div class="q-mb-lg">
          <q-select
            v-model="token"
            label="Select your wallet"
            outlined
            :options="supportedNetworks"
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
              >
                <q-item-section>
                  <q-item-label>
                    <span class="q-pl-sm ">
                      {{ scope.opt.label }}
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div>
          <q-input
            v-model="key"
            readonly
            filled
            :type="isPwd ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
              <q-icon
                name="content_copy"
                class="cursor-pointer"
                @click="copyToClipboard"
              />
            </template>
          </q-input>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { mapState } from 'vuex';
import Wallet from '@/store/wallet/entities/wallet';

export default {
  name: 'ExportKeys',
  data() {
    return {
      isPwd: true,
      token: {
        label: 'Ethereum',
        value: 'ETHEREUM',
      },
    };
  },

  computed: {
    ...mapState({
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      delay: (state) => { return state.settings.delay; },
      scannedAddress: (state) => { return state.qrcode.scannedAddress; },
      mainNetIds: (state) => { return state.settings.mainNetIds; },
      testNetIds: (state) => { return state.settings.testNetIds; },

    }),
    exportKeysModalOpened: {
      get() {
        return this.$store.state.modals.exportKeysModalOpened;
      },
      set(value) {
        this.$store.dispatch('modals/setExportKeysModalOpened', value);
      },
    },
    showTestnets() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount).showTestnets;
    },
    demoMode() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount).demoMode;
    },
    supportedNetworks() {
      const networks = Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .get();
      if (this.demoMode) {
        return networks.filter((w) => {
          return this.testNetIds.includes(w.chainId);
        });
      }

      return networks.filter((w) => {
        return this.mainNetIds.includes(w.chainId);
      }).map((c) => {
        return {
          label: c.name,
          value: c.network,
        };
      });
    },
    wallet() {
      return Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .where('name', this.token.label)
        .get()[0];
    },
    key() {
      if (this.wallet) {
        if (this.token.value === 'CELO') {
          const coinSDK = this.coinSDKS[this.wallet.sdk](this.wallet.network);
          const keypair = coinSDK.generateKeyPair(this.wallet.hdWallet, 0);
          return keypair.privateKey;
        }
        return this.coinSDKS.Ethereum(this.token.value)
          .generateKeyPair(this.wallet.hdWallet, 0).privateKey;
      }
      return null;
    },
  },
  mounted() {
    if (this.demoMode) {
      this.token = {
        label: 'Ethereum Rinkeby',
        value: 'ETHEREUM_RINKEBY',
      };
    }
  },

  methods: {
    copyToClipboard() {
      try {
        if (window.cordova) {
          cordova.plugins.clipboard.copy(this.key);
        } else {
          this.$clipboard(this.key);
        }
        this.$q.notify({
          message: this.$t('copied'),
          color: 'positive',
          timeout: '1500',
          classes: 'text-center',
        });
      } catch (err) {
        this.errorHandler(err);
      }
    },
  },
};
</script>

<style>

</style>
