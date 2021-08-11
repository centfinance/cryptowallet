<template>
  <div class="chart-container">
    <div class="row justify-center">
      <q-btn
        flat
        class="chart-button"
        :disable="disable===0"
        color="info"
        label="24H"
        @click="onClick(0)"
      />
      <q-btn
        flat
        class="chart-button"
        :disable="disable===1"
        color="info"
        label="1W"
        @click="onClick(1)"
      />
      <q-btn
        flat
        class="chart-button"
        :disable="disable===2"
        color="info"
        label="1M"
        @click="onClick(2)"
      />
    </div>

    <Chart
      v-if="chartData"
      :chart-data="chartData"
      :options="options"
      @legendHtml="updateLegend"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Chart from '@/components/PriceCharts/Chart';

export default {
  name: 'ChartContainer',
  components: { Chart },
  props: {
    datasets: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      newChart: '',
      disable: 0,
    };
  },
  computed: {
    ...mapState({
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
    }),
    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },
    darkMode() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount).darkMode;
    },
    chartData() {
      return {
        datasets: [{
          label: '24H',
          borderColor: '#dd3dff',
          borderWidth: 3,
          pointRadius: 0,
          backgroundColor: 'black',
          data: this.datasets[0].data,
        },
        {
          label: '1W',
          borderColor: '#dd3dff',
          borderWidth: 3,
          pointRadius: 0,
          backgroundColor: 'black',
          hidden: true,
          data: this.datasets[1].data,
        },
        {
          label: '1M',
          borderColor: '#dd3dff',
          borderWidth: 3,
          pointRadius: 0,
          backgroundColor: 'black',
          hidden: true,
          data: this.datasets[2].data,
        }],
      };
    },
    options() {
      return {
        animations: {
          duration: 2000,
        },
        layout: {
          padding: {
            top: 10,
          },
        },
        scales: {
          xAxes: [{
            type: 'time',
            ticks: {
              minRotation: '45',
              fontColor: this.darkMode ? '#ffffff' : '#1d1d1d',
              padding: 15,

            },
            gridLines: {
              display: false,
            },
          }],
          yAxes: [{
            position: 'left',
            color: this.darkMode ? '#ffffff' : '#1d1d1d',
            ticks: {
              fontColor: this.darkMode ? '#ffffff' : '#1d1d1d',
              callback: (value) => { return `$ ${value}`; },
            },
          }],
        },
        legend: {
          display: false,
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          displayColors: false,
        },

      };
    },
  },
  methods: {
    updateLegend(chart) {
      this.newChart = chart;
    },

    onClick(index) {
      this.disable = index;
      const chart = this.newChart;
      [0, 1, 2].forEach((i) => {
        if (i !== index) {
          chart.getDatasetMeta(i).hidden = true;
        }
      });
      chart.getDatasetMeta(index).hidden = false;
      chart.update();
      this.$emit('update', index);
    },
  },
};
</script>

<style>
.chart-button{
    margin-right: 10px;
    margin-left: 10px;
    margin-bottom: 15px;
    margin-top: 10px;
    min-height: 1.75em;
    opacity: 0.6;
    color: white;
}

.chart-container{
    margin: 0;
}

</style>
