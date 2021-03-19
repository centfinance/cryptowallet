<template>
  <div>
    <q-select
      v-model="selectedCountry"
      :options="countries"
      label="Select your country"
      behaviour="dialog"
      @input="(val) => $emit('selectedCountry', val)"
    >
      <template
        v-if="selectedCountry"
        v-slot:prepend
      >
        <q-avatar>
          <img :src="selectedCountry.flag">
        </q-avatar>
      </template>
      <template v-slot:option="scope">
        <q-item
          v-bind="scope.itemProps"
          class="q-mx-sm"
          v-on="scope.itemEvents"
        >
          <q-item-section avatar>
            <img
              :src="scope.opt.flag"
            >
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ scope.opt.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Account from '@/store/wallet/entities/account';
import SupportedCountries from '@/store/settings/state/transakSupportedCountries';

export default {
  name: 'SelectCountry',

  data() {
    return {
      // selectedCountry: null,
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
    selectedCountry: {
      get() {
        return this.account.country;
      },
      set(val) {
        Account.$update({
          where: this.authenticatedAccount,
          data: {
            country: val,
          },
        });
      },
    },
    countryList() {
      return SupportedCountries;
    },
    wallet() {
      if (this.id) {
        return this.$store.getters['entities/wallet/find'](this.id);
      }
      return {
        externalAddress: this.defaultWallet.externalAddress,
      };
    },
    countries() {
      if (this.countryList) {
        let rampCountry = [];
        if (this.wallet.network.toLowerCase() === 'xdai') {
          for (let i = 0; i < this.countryList.length; i += 1) {
            if (this.countryList[i].alpha2 !== 'NZ'
                && this.countryList[i].alpha2 !== 'MX'
                && this.countryList[i].alpha2 !== 'US'
                && this.countryList[i].alpha2 !== 'AU'
                && this.countryList[i].alpha2 !== 'CA'
                && this.countryList[i].alpha2 !== 'HK'
                && this.countryList[i].alpha2 !== 'IN'
                && this.countryList[i].alpha2 !== 'IN') {
              rampCountry.push(this.countryList[i]);
            }
          }
        } else {
          rampCountry = this.countryList;
        }

        return rampCountry.filter(({ isAllowed }) => {
          return isAllowed;
        })
          .map((country) => {
            return {
              label: country.name,
              value: country,
              flag: `https://www.countryflags.io/${country.alpha2}/flat/32.png`,
            };
          });
      }
      return null;
    },
  },

  mounted() {
    // eslint-disable-next-line no-magic-numbers
    const lang = navigator.language.slice(-2).toUpperCase();
    const country = this.countries.find(({ value }) => { return value.alpha2 === lang; });
    if (country) { this.selectedCountry = country; }

    setTimeout(() => {
      this.$emit('selectedCountry', this.selectedCountry);
      // eslint-disable-next-line no-magic-numbers
    }, 1000);
  },
};
</script>

<style>

</style>
