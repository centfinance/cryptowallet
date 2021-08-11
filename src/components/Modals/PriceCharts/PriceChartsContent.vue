<template>
  <div>
    <div
      :class="{ active: loading }"
      class="sending-spinner-overlay"
    >
      <Spinner />
    </div>
    <div
      v-if="wallet"
      class="header-section"
    >
      <div class="header-back-button-wrapper">
        <q-btn
          icon="arrow_back"
          size="lg"
          class="icon-btn back-arrow-btn"
          flat
          @click.prevent="goBack"
        />
      </div>

      <div>
        <h1 class="header-h1">
          <img
            :src="coinLogo"
            class="coin-logo token-icon"
          >
          {{ wallet.symbol }}
        </h1>
      </div>

      <div
        class="header-settings-button-wrapper"
      >
        <q-btn
          icon="refresh"
          color="secondary"
          size="lg"
          class="icon-btn icon-btn-right"
          flat
          @click="loadData"
        />
      </div>
    </div>
    <div
      v-if="wallet && latestPrice"
      class="modal-layout-wrapper"
    >
      <div class="price-info justify-center">
        <div class="row labels">
          <div class="col-6">
            1 {{ coinSymbol }} / {{ selectedCurrency.code }}
          </div>
          <div
            v-if="volume"
            class="col-6"
          >
            {{ $t('volume24h') }} {{ selectedCurrency.code }}
          </div>
        </div>
        <div class="row price">
          <div class="col-6">
            {{ selectedCurrency.symbol }}
            {{ latestPrice.data.PRICE.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') }}
          </div>
          <div
            v-if="volume"
            class="col-6"
          >
            {{ selectedCurrency.symbol }}
            {{
              latestPrice.data.TOTALVOLUME24HOURTO.toFixed(0).replace(
                /(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1,")
            }}
          </div>
        </div>
        <div
          v-if="chartData"
          :style="{ color: percentColor}"
          class="row"
        >
          <div class="col-6">
            {{ percentChange.toFixed(2) }}%
          </div>
        </div>
      </div>
      <PriceChart
        v-if="(chartData || showChart)"
        :datasets="chartData"
        @update="updatePercent"
      />
      <div class="row justify-center">
        {{ $t('lastUpdated') }}: {{ new Date(latestPrice.updated).toLocaleString('default') }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PriceChart from '@/components/PriceCharts/ChartContainer';
import Spinner from '@/components/Spinner';
import Coin from '@/store/wallet/entities/coin';
import Prices from '@/store/prices';

export default {
  name: 'PriceCharts',
  components: {
    PriceChart,
    Spinner,
  },
  data() {
    return {
      loading: false,
      showChart: false,
      chartIndex: 0,
    };
  },
  computed: {
    ...mapState({
      id: (state) => { return state.route.params.id; },
      delay: (state) => { return state.settings.delay; },
    }),
    wallet() {
      return this.$store.getters['entities/wallet/find'](this.id);
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
    coinIdentifier() {
      if (this.coin.sdk === 'ERC20' && this.coin.network !== 'CELO') {
        return this.coin.contractAddress;
      }
      return this.wallet.symbol === 'CELO' ? 'celo' : this.coin.identifier;
    },
    coinSymbol() {
      return this.coin.symbol;
    },
    latestPrice() {
      const prices = this.$store.getters['entities/latestPrice/find'](`${this.coinIdentifier}_${this.selectedCurrency.code}`);
      if (!prices) {
        return null;
      }
      return prices;
    },
    volume() {
      return this.latestPrice.data.TOTALVOLUME24HOURTO || null;
    },
    chartData() {
      const day = Prices.find([`${this.coinIdentifier}_${this.selectedCurrency.code}_day`]);
      const week = Prices.find([`${this.coinIdentifier}_${this.selectedCurrency.code}_week`]);
      const month = Prices.find([`${this.coinIdentifier}_${this.selectedCurrency.code}_month`]);
      if (!day || !week || !month) {
        return null;
      }
      return [
        day,
        week,
        month,
      ];
    },
    percentChange: {
      get() {
        return this.priceChange(this.chartIndex);
      },
      set(index) {
        this.chartIndex = index;
      },
    },
    percentColor() {
      if (this.percentChange > 0) {
        return '#00FF00';
      }
      return '#de4662';
    },
    coinLogo() {
      return this.coin.logo;
    },
  },
  async mounted() {
    const updateTime = 120000;
    const currentTime = new Date().getTime();
    if ((currentTime - this.latestPrice.updated) > updateTime) {
      setTimeout(() => {
        this.loadData();
      }, this.delay.normal);
    }
  },
  methods: {
    updatePercent(index) {
      this.percentChange = index;
    },
    priceChange(index) {
      if (!this.chartData) { return null; }
      const { data } = this.chartData[index];
      const percent = 100;
      const change = (data[data.length - 1].y - data[0].y) / data[0].y * percent;
      return change;
    },
    async loadData() {
      const online = window ? window.navigator.onLine : navigator.connection === 'none';
      if (online) {
        this.showChart = false;
        this.loading = true;

        try {
          await this.backEndService.loadCoinPriceData(this.coinIdentifier, 2);
        } catch (err) {
          this.errorHandler(err);
        }
        this.percentChange = 0;

        this.loading = false;
        this.showChart = true;
      }
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style lang='styl'>

.q-toolbar{
  background-color: #1e3c57;
}

.price-info{
  margin-top: 15px;
  margin-bottom: 10px;
  padding: 0 0.5em;
}

.price-info .row{
  padding-bottom: 5px;
}

.row .price-percent{
  color: #de4662;
}

.price{
  font-size: x-large;
}

.labels{
  color: var(--q-color-info);
}

.sending-spinner-overlay {
 position: absolute;
 height: 100vh;
 width: 100vw;
 z-index: 0;
 display: flex;
 align-items: center;
 justify-content: center;
 background: rgba(255, 255, 255, 0.9);
 opacity: 0;
 transition: all ease-in-out 250ms;
}

.sending-spinner-overlay.active{
 opacity: 1;
 z-index: 2;
}
</style>
