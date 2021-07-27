<template>
  <div :class="{ simple: simple }">
    <div class="wrapper">
      <div>
        <div class="wallet-name">
          <img
            width="24px"
            :src="coinLogo"
            class="token-icon"
          >
          {{ wallet.symbol }}
        </div>

        <div
          v-if="simple || quick"
          class="quick-coin-actions"
        >
          <q-btn-group v-if="!buy">
            <q-btn
              :disabled="cantSend"
              icon="send"
              size="xs"
              color="primary"
              label="Send"
              class="wallet-group-btn"
              flat
              @click.stop="send"
            />
            <q-btn
              icon="call_received"
              size="xs"
              color="primary"
              label="Receive"
              class="wallet-group-btn"
              flat
              @click.stop="receive"
            />
          </q-btn-group>
        </div>
        <div
          v-if="buy"
          class="quick-coin-actions"
        >
          <q-btn
            icon="fas fa-minus"
            size="xs"
            class="q-pr-xs"
            color="accent"
            text-color="info"
            label="Sell"
            disable
            dense
            rounded
            @click.stop="addFunds"
          />
          <q-btn
            icon="fas fa-credit-card"
            size="xs"
            class="q-pr-xs"
            color="accent"
            text-color="info"
            label="Buy"
            dense
            rounded
            @click.stop="addFunds"
          />
        </div>
      </div>
      <div class="wallet-prices">
        <Amount
          v-if="latestPrice"
          :amount="unconfirmedBalance()"
          :rate="latestPrice"
          :prepend-plus-or-minus="false"
          :currency="selectedCurrency"
          :to-currency="true"
          :coin="wallet.name"
          format="0,0[.]00"
        />
        <div class="in-coin">
          {{ balanceInCoin }}
          <!-- {{ coinSymbol }} -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Amount from '@/components/Wallet/Amount';
import Coin from '@/store/wallet/entities/coin';
import {
  AmountFormatter,
  getBalance,
} from '@/helpers';

export default {
  name: 'CoinHeader',
  components: {
    Amount,
  },
  props: {
    wallet: {
      type: Object,
      required: true,
    },
    simple: {
      type: Boolean,
      default: false,
    },
    quick: {
      type: Boolean,
      default: false,
    },
    buy: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapState({
      authenticatedAccount: (state) => {
        return state.settings.authenticatedAccount;
      },
    }),

    demoMode() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount).demoMode;
    },
    coinLogo() {
      if (this.coin.icon) {
        return `data:image/png;base64, ${this.coin.icon}`;
      }
      return this.coin.logo;
    },

    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },

    coin() {
      return Coin.query()
        .where('name', this.wallet.name)
        .where('contractAddress', this.wallet.contractAddress)
        .get()[0];
    },

    coinSymbol() {
      return this.coin.symbol;
    },

    transakTestnet() {
      return this.wallet.name === 'Ethereum Rinkeby';
    },

    canPurchase() {
      if (this.coin.transak) { return true; }
      return false;
    },

    latestPrice() {
      const val = this.wallet.network === 'CELO' ? this.wallet.network.toString().toLowerCase() : this.wallet.identifier;
      const prices = this.$store.getters['entities/latestPrice/find'](`${val}_${this.selectedCurrency.code}`);
      if (prices) {
        return prices.data.PRICE;
      }
      return null;
    },

    balanceInCoin() {
      const balance = this.unconfirmedBalance();

      const balanceInCoin = new AmountFormatter({
        amount: balance,
        rate: this.latestPrice,
        format: '0.00000000',
        prependPlusOrMinus: false,
        removeTrailingZeros: true,
      });

      return balanceInCoin.getFormatted();
    },

    cantSend() {
      return getBalance(this.wallet, this.authenticatedAccount).available === 0;
    },
  },

  methods: {
    send() {
      this.$router.push({ path: `/wallet/single/send/${this.wallet.id}` });
    },
    receive() {
      this.$router.push({ path: `/wallet/single/receive/${this.wallet.id}` });
    },
    addFunds() {
      this.$router.push({ path: `/wallet/single/add-funds/${this.wallet.id}` });
    },
    unconfirmedBalance() {
      return getBalance(this.wallet, this.authenticatedAccount).unconfirmed;
    },
  },
};
</script>

<style lang="styl" scoped>
.wrapper {
  display: flex;
  justify-content: space-between;
}

.wallet-name {
  display: flex;
  align-items: center;
  font-size: 0.9em;
  font-family: 'Inter-Medium';
  color:rgb(128,128,128);
}

.simple .wallet-name {
  display: none;
}

.wallet-name img {
  margin-right: 0.5em;
}

.wallet-prices {
  font-size: 0.85em;
  display: flex;
  color:gray;
  justify-content: flex-end;
  flex-direction: column;
  text-align: right;
}

.simple .wrapper {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-flow: column-reverse;
}

.simple .wallet-prices {
  font-size: 1.8rem;
  text-align: center;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  color: var(--q-color-accent);
}

.wallet-prices > div {
  margin-left: auto;
}

.simple .wallet-prices > div {
  margin: 0 auto;
}

.simple .in-coin {
  font-size: 1rem;
  opacity: 0.8;
}

.quick-coin-actions {
  margin-top: 0.2rem 0;
}
</style>
