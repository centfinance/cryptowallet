<template>
  <div>
    <q-dialog
      v-model="addWalletModalOpened"
      :maximized="true"
      transition-show="slide-up"
      transition-hide="slide-down"
      content-class="dark-modal"
      @before-hide="close"
    >
      <div>
        <div class="header-section">
          <div class="header-back-button-wrapper">
            <q-btn
              icon="arrow_back"
              size="lg"
              class="icon-btn back-arrow-btn"
              flat
              @click.prevent="closeModal"
            />
          </div>
          <h1 class="header-h1">
            {{ $t('wallets') }}
          </h1>
          <div
            class="header-settings-button-wrapper"
          >
            <q-btn
              v-if="!search"
              icon="add"
              color="secondary"
              size="lg"
              class="icon-btn icon-btn-right"
              flat
              @click.prevent="openAddWalletModal"
            />
          </div>
        </div>

        <div class="modal-layout-wrapper no-padding">
          <WalletsFilter
            v-if="search"
          />
          <WalletsList
            v-if="!search"
            :wallets="supportedCoins"
          />
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import WalletsList from '@/components/Wallet/WalletsList';
import WalletsFilter from '@/components/Wallet/WalletsFilter';
import Wallet from '@/store/wallet/entities/wallet';
import Address from '@/store/wallet/entities/address';
import Tx from '@/store/wallet/entities/tx';
import Utxo from '@/store/wallet/entities/utxo';
import Coin from '@/store/wallet/entities/coin';

export default {
  name: 'AddWallet',
  components: {
    WalletsList,
    WalletsFilter,
  },
  data() {
    return {
      loading: false,
      msToS: 1000,
      search: false,
    };
  },
  computed: {
    ...mapState({
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
    }),
    supportedCoins() {
      return Coin.all();
    },
    addWalletModalOpened: {
      get() {
        return this.$store.state.modals.addWalletModalOpened;
      },
      set(value) {
        this.$store.dispatch('modals/setAddWalletModalOpened', value);
      },
    },
  },
  async beforeDestroy() {
    await this.close();
  },
  methods: {
    closeModal() {
      this.addWalletModalOpened = false;
    },
    openAddWalletModal() {
      this.$store.dispatch('modals/setAddErc20ModalOpened', true);
    },

    toggleSearch(val) {
      this.search = val;
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

    async storeAddresses(addrs, id, chain) {
      if (addrs.length > 0) {
        const addresses = addrs.map((addr) => {
          addr.account_id = this.authenticatedAccount;
          addr.wallet_id = id;
          addr.chain = chain;
          addr.hash = addr.address;
          return addr;
        });
        await Address.$insert({ data: addresses });
      }
    },

    async enableBitcoin(coinSDK, initializedWallet, wallet) {
      const {
        txHistory,
        externalAccountDiscovery,
        internalAccountDiscovery,
        externalChainAddressIndex,
        internalChainAddressIndex,
        utxos,
      } = await this.discoverWallet(initializedWallet, coinSDK, wallet.network, wallet.sdk);

      const keyPair = coinSDK.generateKeyPair(initializedWallet, externalChainAddressIndex);

      await Wallet.$update({
        where: wallet.id,
        data: {
          externalChainAddressIndex,
          internalChainAddressIndex,
          externalAddress: keyPair.address,
        },
      });

      const newAddress = {
        account_id: this.authenticatedAccount,
        wallet_id: wallet.id,
        chain: 'external',
        address: keyPair.address,
        index: externalChainAddressIndex,
      };

      if (utxos.length > 0) {
        const unspentTxs = utxos.map((utxo) => {
          utxo.account_id = this.authenticatedAccount;
          utxo.wallet_id = wallet.id;
          return utxo;
        });
        await Utxo.$insert({ data: unspentTxs });
      }

      await Address.$insert({ data: newAddress });
      await this.storeTransactions(txHistory.txs, wallet.id);
      await this.storeAddresses(externalAccountDiscovery.active, wallet.id, 'external');
      await this.storeAddresses(internalAccountDiscovery.used, wallet.id, 'internal');
    },

    async enableEthereum(coinSDK, initializedWallet, wallet) {
      const {
        txHistory,
        accounts,
        balance,
      } = await this.discoverWallet(initializedWallet, coinSDK, wallet.network, wallet.sdk);

      await Wallet.$update({
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
    },

    async enableWallet(wallet) {
      let success = true;
      const coinSDK = this.coinSDKS[wallet.sdk](wallet.network);
      try {
        await this.backEndService.loadCoinPriceData(wallet.identifier);

        const initializedWallet = wallet.hdWallet;

        if (!this.activeWallets[this.authenticatedAccount]) {
          this.activeWallets[this.authenticatedAccount] = {};
        }

        this.activeWallets[this.authenticatedAccount][wallet.name] = initializedWallet;

        if (wallet.sdk === 'Bitcoin') {
          await this.enableBitcoin(coinSDK, initializedWallet, wallet);
        }
        if (wallet.sdk === 'Ethereum') {
          await this.enableEthereum(coinSDK, initializedWallet, wallet);
        }
      } catch (err) {
        success = false;
        this.errorHandler(err);
      }

      Wallet.$update({
        where: wallet.id,
        data: { imported: success, enabled: success },
      });
    },

    async enableErc20Wallet(wallet) {
      let success = true;
      try {
        const coinSDK = this.coinSDKS[wallet.sdk](wallet.network);
        const parentSDK = this.coinSDKS[wallet.parentSdk](wallet.network);
        console.log(`ENABLE ERC20WALLET ${wallet.identifier}`);
        await this.backEndService.loadCoinPriceData(wallet.identifier);

        if (!wallet.erc20Wallet.address) {
          const parentWallet = this.activeWallets[this.authenticatedAccount][wallet.parentName];
          const keyPair = await parentSDK.generateKeyPair(parentWallet, 0);
          wallet.erc20Wallet = await coinSDK.generateERC20Wallet(
            keyPair,
            wallet.name,
            wallet.symbol,
            wallet.contractAddress,
            wallet.decimals,
          );
        }

        this.activeWallets[this.authenticatedAccount][wallet.name] = wallet.erc20Wallet;

        const {
          txHistory,
          balance,
        } = await this.discoverWallet(wallet.erc20Wallet, coinSDK, wallet.network, wallet.sdk);

        Wallet.$update({
          where: wallet.id,
          data: {
            externalChainAddressIndex: 0,
            internalChainAddressIndex: 0,
            confirmedBalance: balance,
            externalAddress: wallet.erc20Wallet.address,
            erc20Wallet: wallet.erc20Wallet,
          },
        });

        const newAddress = {
          account_id: this.authenticatedAccount,
          wallet_id: wallet.id,
          chain: 'external',
          address: wallet.erc20Wallet.address,
          index: 0,
        };
        await Address.$insert({ data: newAddress });
        await this.storeTransactions(txHistory, wallet.id);
      } catch (err) {
        success = false;
        this.errorHandler(err);
      }
      Wallet.$update({
        where: wallet.id,
        data: { imported: success, enabled: success },
      });
    },

    async close() {
      this.$root.$emit('enableTxNotifications', false);
      const wallets = Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .where('enabled', true)
        .where('imported', false)
        .get();


      try {
        if (wallets.length > 0) {
          this.$store.dispatch('settings/setLoading', true);

          await Promise.all(
            wallets.filter((wallet) => { return wallet.sdk !== 'ERC20'; })
              .map((wallet) => { return this.enableWallet(wallet); }),
          );

          await Promise.all(
            wallets.filter((wallet) => { return wallet.sdk === 'ERC20'; })
              .map((wallet) => { return this.enableErc20Wallet(wallet); }),
          );
        }
      } finally {
        this.addWalletModalOpened = false;
        this.search = false;
        this.$root.$emit('enableTxNotifications', true);
        this.$store.dispatch('settings/setLoading', false);
      }
    },
  },
};
</script>

<style>
.close-btn .q-btn__content {
  justify-content: flex-start;
}

.modal.app-loading {
  opacity: 0.8;
}
</style>
