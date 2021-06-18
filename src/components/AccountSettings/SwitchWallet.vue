<template>
  <div
    class="settings-row"
  >
    <div>
      <!-- {{ $t('toggleDarkMode') }} -->
      Switch Wallet
    </div>
    <div>
      <q-radio
        v-model="walletType"
        val="celo"
        label="Celo"
        @input="updateWallet('celo')"
      />
      <q-radio
        v-model="walletType"
        val="ether"
        label="Ether"
        @input="updateWallet('ether')"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
// import Account from '@/store/wallet/entities/account';
import initialiseWallet from '@/helpers/InitialiseWallet';

export default {
  name: 'SwitchWallet',

  computed: {
    ...mapState({
      selectedAccount: (state) => { return state.settings.selectedAccount; },
      delay: (state) => { return state.settings.delay; },
    }),
    account() {
      return this.$store.getters['entities/account/find'](this.selectedAccount.id);
    },
    walletType() {
      return this.account.walletType;
    },
  },

  methods: {
    async updateWallet(val) {
      // eslint-disable-next-line no-console
      // console.log(`New WAllet: ${val}`);
      this.$store.dispatch('settings/setWalletType', val);
      const accounts = this.$store.getters['entities/account/query']().get();
      const account = accounts.find((item) => {
        return item.walletType === val;
      });
      if (account) {
        this.$store.dispatch('settings/setLoading', true);
        await new Promise((r) => { return setTimeout(r, 0); });
        this.$store.dispatch('settings/setSelectedAccount', account);
        this.$store.dispatch('settings/setAuthenticatedAccount', account.id);
        const currency = this.$store.state.settings.supportedCurrencies.find((item) => {
          return item.code === account.currency;
        });
        this.$i18n.locale = account.locale;
        this.$store.dispatch('settings/setCurrency', currency);
        // await this.decryptData(this.account.id, this.pin.join(''));
        await initialiseWallet(account.id);

        const connect = await this.backEndService.connect();
        if (connect) {
          await this.backEndService.loadPriceFeed();
        }
        this.$router.push({ path: '/wallet' });
        this.$store.dispatch('settings/setLayout', 'light');
        await new Promise((r) => { return setTimeout(r, this.delay.long); });
        this.$store.dispatch('settings/setLoading', false);
      } else {
        this.$router.push({ path: '/setup/0' });
      }
    },
  },
};
</script>

<style>

</style>
