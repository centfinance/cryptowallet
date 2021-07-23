<template>
  <div
    v-if="showContent"
    class="container"
  >
    <div>
      <h1 class="setup">
        {{ $t('completeSetup') }}
      </h1>
    </div>
    <div class="slide-wrapper">
      <div class="icon-wrapper">
        <q-icon
          name="wifi"
          size="10rem"
          color="white"
          class="temp-ill"
        />
      </div>
      <p>
        {{ $t('reconnectToInternet') }}
      </p>
    </div>
    <div class="btns-wrapper">
      <q-btn
        :disabled="!online"
        :label="$t('activateYourWallet')"
        color="yellow"
        text-color="blueish"
        @click="complete"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Network } from '@/helpers';
// import WalletWorker from '@/workers/RefreshWallet';
import Wallet from '@/store/wallet/entities/wallet';
import Address from '@/store/wallet/entities/address';
import Tx from '@/store/wallet/entities/tx';

export default {
  name: 'Complete',
  data() {
    return {
      online: null,
      account: null,
      showContent: false,
    };
  },
  computed: {
    ...mapState({
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      setup: (state) => { return state.setup; },
      delay: (state) => { return state.settings.delay; },
    }),

    supportedCoins() {
      return this.$store.state.settings.supportedCoins;
    },
  },

  async mounted() {
    this.network = new Network(this.$q.platform.is);
    this.online = this.network.isOnline();

    this.network
      .on('offline', () => {
        this.online = false;
      })
      .on('online', () => {
        this.online = true;
      });
    if (!this.setup.accountCreated) {
      if (this.online) {
        await this.complete();
      } else {
        this.showContent = true;
      }
    }
  },

  methods: {
    /**
     * complete setup and store account entity.
     */
    async complete() {
      this.$store.dispatch('settings/setLoading', true);

      setTimeout(async () => {
        try {
          const account = await this.accountInitializer.createAccount(this.setup);
          this.$store.dispatch('settings/setSelectedAccount', this.setup.accountName);
          await this.accountInitializer.createWallets(this.setup, account.id, this.supportedCoins);

          this.$store.dispatch('setup/setAccountCreated');
          this.$store.dispatch('settings/setAuthenticatedAccount', account.id);

          Object.getPrototypeOf(this.$root).backEndService = new this.BackEndService(this.$root, this.authenticatedAccount, this.setup.pinArray.join(''));
          // Object.getPrototypeOf(this.$root).$walletWorker = await new WalletWorker();

          await this.backEndService.connect();
          await this.backEndService.loadPriceFeed();

          if (this.setup.demoMode) {
            await this.enableWallet('Ethereum Rinkeby');
          } else {
            const ethWallet = await this.enableWallet();
            // eslint-disable-next-line no-unused-vars
            const xdaiWallet = await this.enableWallet('XDai');

            await this.accountInitializer.createERC20Wallets(
              this.setup,
              account.id,
              this.supportedCoins,
              ethWallet,
            );
          }


          this.$store.dispatch('setup/clearSetupData');
          this.$store.dispatch('settings/setLayout', 'light');
          this.$router.push({ path: '/wallet' });
        } catch (err) {
          this.errorHandler(err);
        }
        setTimeout(() => {
          this.$store.dispatch('settings/setLoading', false);
        }, this.delay.normal);
      }, this.delay.normal);
    },
    createDate(timestamp) {
      return new Date(timestamp * this.msToS).getTime();
    },

    async storeTransactions(txs, id) {
      if (txs.length > 0) {
        const transactions = txs.map((tx) => {
          tx.account_id = this.authenticatedAccount;
          tx.wallet_id = id;
          return tx;
        });
        transactions.sort((a, b) => {
          return this.createDate(b.confirmedTime) - this.createDate(a.confirmedTime);
        });
        await Tx.$insert({ data: transactions });
      }
    },

    async enableEthereum(coinSDK, initializedWallet, wallet) {
      const {
        txHistory,
        accounts,
        balance,
      } = await this.discoverWallet(initializedWallet, coinSDK, wallet.network, wallet.sdk);

      Wallet.$update({
        where: wallet.id,
        data: {
          externalChainAddressIndex: 0,
          internalChainAddressIndex: 0,
          confirmedBalance: balance,
          externalAddress: accounts[0].address,
        },
      });

      const newAddress = {
        account_id: this.authenticatedAccount,
        wallet_id: wallet.id,
        chain: 'external',
        address: accounts[0].address,
        index: 0,
      };

      await Address.$insert({ data: newAddress });
      await this.storeTransactions(txHistory.txs, wallet.id);

      return {
        address: accounts[0].address,
        wallet_id: wallet.id,
      };
    },

    async enableWallet(name = 'Ethereum') {
      const wallet = Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .where('name', name)
        .get()[0];

      let success = true;
      const coinSDK = this.coinSDKS[wallet.sdk](wallet.network);
      let walletAddress = {};
      try {
        await this.backEndService.loadCoinPriceData(wallet.identifier);

        const initializedWallet = wallet.hdWallet;

        if (!this.activeWallets[this.authenticatedAccount]) {
          this.activeWallets[this.authenticatedAccount] = {};
        }

        this.activeWallets[this.authenticatedAccount][wallet.name] = initializedWallet;

        walletAddress = await this.enableEthereum(coinSDK, initializedWallet, wallet);
      } catch (err) {
        success = false;
        this.errorHandler(err);
      }

      Wallet.$update({
        where: wallet.id,
        data: { imported: success, enabled: success },
      });
      return walletAddress;
    },
  },
};
</script>
<style>

.icon-wrapper {
  text-align: center;
}
.slide-wrapper {
  width: 100%;
  height: calc(100% - 7rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 .5rem;
}
</style>
