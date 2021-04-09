<template>
  <div>
    <div class="header-section">
      <div class="header-back-button-wrapper">
        <q-btn
          icon="arrow_back"
          size="lg"
          color="primary"
          class="icon-btn back-arrow-btn"
          flat
          @click.prevent="goBack"
        />
      </div>
      <h1 class="header-h1">
        {{ $t('addFunds') }}
      </h1>
    </div>

    <div class="modal-layout-wrapper add-funds">
      <div class="text-center text-weight-bold q-pa-sm">
        Select Your Payment Method
      </div>
      <div>
        <div class="text-center text-weight-bold q-pa-sm">
          <SelectCountry @selectedCountry="(val) => country = val" />
        </div>
        <q-list
          v-if="providers.length > 0"
          padding
          dense
          class="q-gutter-y-md"
        >
          <q-item
            v-for="option in providers"
            :key="option.type"
            clickable
            @click="openProvider(option.provider)"
          >
            <q-item-section
              avatar
              top
            >
              <q-avatar
                :icon="option.icon"
                color="accent"
                text-color="info"
              />
            </q-item-section>
            <q-item-section class="text-black">
              {{ option.type }}
              <q-item-label caption>
                {{ option.caption }}
              </q-item-label>
            </q-item-section>
            <q-item-section
              side
            >
              <q-chip
                square
                size="12px"
                outline
              >
                Fee: {{ option.fee }}
              </q-chip>
            </q-item-section>
            <q-item-section
              side
            >
              <q-chip
                square
                size="12px"
                outline
              >
                {{ option.time }}
              </q-chip>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            @click.stop="receive"
          >
            <q-item-section
              avatar
              top
            >
              <q-avatar
                icon="qr_code"
                color="accent"
                text-color="info"
              />
            </q-item-section>
            <q-item-section class="text-black">
              Send from Wallet/Exchange
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import Coin from '@/store/wallet/entities/coin';
import Wallet from '@/store/wallet/entities/wallet';
import { Ramp } from '@/helpers/Ramp';
import { Transak } from '@/helpers/Transak';
import { Altalix } from '@/helpers/Altalix';
import SelectCountry from './SelectCountry';

export default {
  name: 'AddFunds',
  components: {
    SelectCountry,
  },
  data() {
    return {
      country: null,
      transakTokens: null,
      paymentOptions: [
        {
          type: 'Bank Transfer (Altalix)',
          icon: 'fas fa-university',
          fee: '0.4%',
          time: '1 - 3 hours',
          caption: 'KYC Required',
          provider: 'altalix_bank',
        },
        {
          type: 'Debit Card',
          icon: 'fas fa-credit-card',
          fee: '2.9%',
          time: 'Instant',
          caption: 'Lower Buy Limits',
          provider: 'ramp',
        },
        {
          type: 'Apple Pay',
          icon: 'fab fa-cc-apple-pay',
          fee: '2.9%',
          time: 'Instant',
          caption: 'Lower Buy Limits',
          provider: 'ramp',
        },
        {
          type: 'Credit/Debit Card',
          icon: 'fas fa-credit-card',
          fee: '3.9%',
          time: 'Instant',
          caption: 'Lower Buy Limits',
          provider: 'transak_card',
        },
        {
          type: 'Instant Bank Transfer',
          icon: 'fas fa-university',
          fee: '1.49% - 1.99%',
          time: 'Instant',
          caption: 'No ID Required',
          provider: 'ramp',
        },
        {
          type: 'Manual Bank Transfer (Transak)',
          icon: 'fas fa-university',
          fee: '0.5%',
          time: '1 - 3 hours',
          caption: 'KYC Required',
          provider: 'transak_bank',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      id: (state) => { return parseInt(state.route.params.id, 10); },
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
    }),
    account() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount);
    },
    defaultWallet() {
      return Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .where('name', 'Ethereum')
        .get()[0];
    },
    wallet() {
      if (this.id) {
        return this.$store.getters['entities/wallet/find'](this.id);
      }
      return {
        externalAddress: this.defaultWallet.externalAddress,
      };
    },
    isTestnet() {
      if (this.id) {
        return Coin.findToken(this.wallet.name).testnet;
      }
      return false;
    },
    ramp() {
      if (this.wallet.network === 'XDAI' || this.wallet.network === 'ETHEREUM') {
        return new Ramp(this.$root, this.account, this.wallet, this.isTestnet);
      }
      return new Ramp(this.$root, this.account, this.defaultWallet, this.isTestnet);
    },

    transak_bank() {
      return new Transak(this.$root,
        this.account, this.defaultWallet, this.transakTokens, false, this.isTestnet);
    },
    altalix_bank() {
      return new Altalix(this.$root, this.account, this.defaultWallet, this.isTestnet);
    },
    transak_card() {
      return new Transak(this.$root,
        this.account, this.defaultWallet, this.transakTokens, true, this.isTestnet);
    },
    applePayEnabled() {
      return /iPad|iPhone|iPod/.test(navigator.platform)
       || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    },
    providers() {
      if (this.account.country && this.transakTokens) {
        return this.paymentOptions.filter((option) => {
          if (option.type === 'Apple Pay' && !this.applePayEnabled) {
            return false;
          }
          if (this.wallet.network === 'XDAI'
              && (option.type === 'Credit/Debit Card'
              || option.type === 'Manual Bank Transfer')) {
            return false;
          }
          return this[option.provider].isAvailable();
        });
      }
      return [];
    },
  },

  beforeDestroy() {
    this.ramp.close();
    this.transak_bank.close();
    this.transak_card.close();
  },

  async mounted() {
    const t = (await axios.get('https://api.transak.com/api/v2/currencies/crypto-currencies')).data.response;
    const e = t.filter((token) => { return token.network.name === 'ethereum'; });
    const m = e.map((token) => { return token.symbol; }).join();
    this.transakTokens = m;
  },

  methods: {
    openProvider(provider) {
      this[provider].open();
    },

    receive() {
      this.$router.push({ path: `/wallet/receive/${this.defaultWallet.id}` });
    },

    goBack() {
      this.$router.go(-1);
    },
  },
};


</script>

<style>

.add-funds .q-chip {
  margin: 0 0.2rem;
  padding: 0.5rem 0.4rem;
}
.checkbox-wrapper {
  margin-top: 2rem;
  padding: 1rem;
  background: whitesmoke;
  border-radius: 0.3rem;
}

.checkbox-wrapper .q-checkbox__label {
  opacity: 1;
  font-family: Inter-Medium;
  margin-left: 0.8rem;
}

.checkbox-wrapper .q-checkbox-icon {
  font-size: 2rem;
}

.payment-logo {
  width: 6rem;
}

.transak_modal {
  padding-top: 35px;
}

.transak_close {
  margin-top: 10px!important;
  right: 5px!important;
  color: black!important;
}

body.desktop .transak_modal {
  max-width: 600px;
}

/* .q-inner-loading {
  background: white;
} */
</style>
