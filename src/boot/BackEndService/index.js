/* eslint-disable max-len */
import axios from 'axios';
import Account from '@/store/wallet/entities/account';
import Prices from '@/store/prices';
import LatestPrice from '@/store/latestPrice';
import Fees from '@/store/fees';
import Wallet from '@/store/wallet/entities/wallet';

class BackEndService {
  vm = null;

  accessToken = null;

  refreshToken = null;

  accountId = null;

  account = null;

  password = null;

  delay = null;

  longDelay = null;

  maxConnectAttempts = null;

  maxTryAttempts = null;

  createdCode = null;

  successCode = null;


  constructor(vm, authenticatedAccount, password) {
    this.vm = vm;
    this.accountId = authenticatedAccount;
    this.account = this.vm.$store.getters['entities/account/find'](this.accountId);
    this.password = password;
    this.setRefreshToken(this.account.refresh_token);
    this.delay = 500;
    this.longDelay = 2500;
    this.maxConnectAttempts = 3;
    this.maxTryAttempts = 3;
    this.createdCode = 201;
    this.successCode = 200;
  }

  /**
   * Used to set value of the new refresh token
   * Also encrypts and puts the token in the persistent database
   * @param {String} token
   */
  setRefreshToken(token) {
    Account.$update({
      where: this.accountId,
      data: { refresh_token: token },
      password: this.password,
    });

    this.refreshToken = token;
  }

  /**
   * Recursivly authenticates against the backend service
   * @param  {Number} attempts
   * @return {Promise}
   */
  connect(attempts = 0) {
    return new Promise(async (resolve) => {
      const attemptLimit = this.maxConnectAttempts;
      const network = window ? window.navigator.onLine : navigator.connection === 'none';

      if (attempts >= attemptLimit) {
        this.vm.errorHandler(new Error(this.vm.$t('failedToConnect')), false);
        return resolve(false);
      }

      if (!network) {
        return resolve(false);
      }

      try {
        if (this.refreshToken) {
          try {
            // access denied, refresh access token
            const code = await this.refreshAuth();
            if (code === this.createdCode) {
              return resolve(true);
            }
          } catch (error) {
            // refresh token failed, re-authenticate
            const code = await this.auth();
            if (code === this.successCode) {
              return resolve(true);
            }
          }
        } else {
          const code = await this.auth();
          if (code === this.successCode) {
            return resolve(true);
          }
        }
      } catch (err) {
        this.vm.errorHandler(err, false);
      }

      setTimeout(() => {
        this.vm.$toast.create(10, this.vm.$t('failedToConnect'), this.delay);
        resolve(this.connect(attempts += 1));
      }, this.longDelay);

      return false;
    });
  }

  /**
   * Calls the auth endpoint
   * @return {String}
   */
  async auth() {
    // const response = await axios.get(`
    // ${process.env.BACKEND_SERVICE_URL}/auth/token/${Math.random().toString()}`);

    const response = await axios({
      method: 'get',
      timeout: 2000,
      url: `${process.env.BACKEND_SERVICE_URL}/auth/token/${Math.random().toString()}`,
    });

    if (response.data) {
      this.accessToken = response.data.accessToken;
      this.setRefreshToken(response.data.refreshToken);
    }

    return response.status;
  }

  /**
   * Calls the refresh auth endpoint with the refresh token
   * @return {String}
   */
  async refreshAuth() {
    const data = {
      refresh_token: this.refreshToken,
    };
    // const response = await axios.post(`${process.env.BACKEND_SERVICE_URL}/auth/refresh`, data);
    const response = await axios({
      method: 'post',
      timeout: 2000,
      url: `${process.env.BACKEND_SERVICE_URL}/auth/refresh`,
      data,
    });

    if (response.data) {
      this.accessToken = response.data.accessToken;
      this.setRefreshToken(response.data.refreshToken);
    }

    return response.status;
  }

  /**
   * Sets up authorization headers for axios requests
   * @return {Object}
   */
  async getAxiosConfig() {
    return {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };
  }

  /**
   * Used to make calls to the API
   * @param  {String} URL
   * @param  {Number} attempts
   * @return {Object}
   */
  try(URL, attempts = 0) {
    return new Promise(async (resolve, reject) => {
      const attemptLimit = this.maxTryAttempts;
      if (attempts >= attemptLimit) {
        this.vm.errorHandler(new Error(this.vm.$t('failedToConnect')), false);
        return resolve(false);
      }

      try {
        const config = await this.getAxiosConfig();
        config.timeout = 2000;
        const response = await axios.get(URL, config);
        this.setRefreshToken(response.headers.new_refresh_token);
        return resolve(response);
      } catch (err) {
        const network = window ? window.navigator.onLine : navigator.connection === 'none';
        if (!network) {
          return reject(new Error(this.vm.$t('noInternet')));
        }
        if (err.response && err.response.status) {
          const unauthorized = 401;
          if (err.response.status === unauthorized) {
            await this.connect();
          }
          const notFound = 422;
          const internalError = 500;
          if (err.response.status === notFound || err.response.status === internalError) {
            return resolve(false);
          }
        }
      }

      setTimeout(() => {
        resolve(this.try(URL, attempts += 1));
      }, this.longDelay);

      return false;
    });
  }

  /**
   * Used to call the price-feed endpoint
   * @param  {Array}  coins
   * @param  {Array}  currencies
   * @return {Object}
   */
  async getPriceFeed(coins, currencies = ['ALL'], attempts = 0) {
    const result = await this.try(`${process.env.BACKEND_SERVICE_URL}/price-feed/${coins.join(',')}/${currencies.join(',')}`, attempts);
    return result;
  }

  /**
   * Used to call the carousal endpoint
   * @return {Object}
   */
  async getCarousal(attempts = 0) {
    const result = await this.try(`${process.env.BACKEND_SERVICE_URL}/carousal-list/dashboard/`, attempts);
    return result;
  }

  /**
   * Used to call the price-history endpoint
   * @param  {Array}  coin
   * @param  {Array}  currency
   * @param  {String} period
   * @return {Object}
   */
  async getHistoricalData(coin, currency, period, attempts = 0) {
    const result = await this.try(`${process.env.BACKEND_SERVICE_URL}/price-history/${coin}/${currency}/${period}`, attempts);
    if (!result) { return false; }

    return result.data;
  }

  /**
   * Used to call the fee-estimate endpoint
   * @param  {String} coin
   * @return {Object}
   */
  async getTransactionFee(coin, attempts = 0) {
    const fee = Fees.find([coin]);
    const currentTime = new Date().getTime();
    const updateTime = 300000;

    if (!fee || (currentTime - fee.timestamp) > updateTime) {
      const result = await this.try(`${process.env.BACKEND_SERVICE_URL}/fee-estimate/${coin}`, attempts);
      result.data.timestamp = currentTime;
      if (fee) {
        Fees.$update({
          where: coin,
          data: result.data,
        });
      } else {
        Fees.$insert({ data: result.data });
      }
      return result.data;
    }
    return fee;
  }

  /**
   * Puts the price data in the database
   * @param  {String} coin
   * @param  {Object} priceData
   * @return {Promise}
   */
  storePriceData(coin, priceData, currency = this.vm.$store.state.settings.selectedCurrency.code) {
    return new Promise(async (resolve) => {
      const checkPriceExists = (symbol, data) => {
        const price = LatestPrice.find([`${symbol}_${currency}`]);
        if (!price) {
          LatestPrice.$insert({
            data: {
              coin,
              currency,
              updated: +new Date(),
              data,
            },
          });
          return false;
        }
        return true;
      };

      if (checkPriceExists(coin, priceData)) {
        LatestPrice.$update({
          data: {
            coin,
            currency,
            updated: +new Date(),
            data: priceData,
          },
        });
      }

      resolve();
    });
  }

  storeChartData(coin, period, chartData) {
    const { selectedCurrency } = this.vm.$store.state.settings;

    return new Promise(async (resolve) => {
      const checkChartDataExists = (symbol, data) => {
        const chartDataExists = Prices.find([`${symbol}_${selectedCurrency.code}_${period}`]);
        if (!chartDataExists) {
          Prices.$insert({
            data: {
              coin,
              currency: selectedCurrency.code,
              period,
              updated: +new Date(),
              data,
            },
          });
          return false;
        }
        return true;
      };

      if (checkChartDataExists(coin, chartData)) {
        Prices.$update({
          data: {
            coin,
            currency: selectedCurrency.code,
            period,
            updated: +new Date(),
            data: chartData,
          },
        });
      }
      resolve();
    });
  }

  /**
   * Calls the API and and stores the price data
   */
  async loadPriceFeed(attempts = 0) {
    const {
      selectedCurrency,
      authenticatedAccount,
      supportedCurrencies,
    } = this.vm.$store.state.settings;
    const wallets = Wallet.query()
      .where('account_id', authenticatedAccount)
      .where('imported', true)
      .get();

    const coins = [];
    wallets.forEach((coin) => {
      const price = LatestPrice.find(`${coin.identifier}_${selectedCurrency.code}`);
      if (price) {
        coins.push(coin.identifier);
      }
    });

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    coins.filter(onlyUnique);

    try {
      if (coins.length > 0) {
        const prices = await this.getPriceFeed(coins, ['ALL'], attempts);

        if (prices) {
          const promises = [];
          prices.data.forEach((data) => {
            supportedCurrencies.forEach((currency) => {
              promises.push(new Promise((res) => {
                return res(this.storePriceData(data.code,
                  data[currency.code],
                  currency.code));
              }));
            });
          });

          await Promise.all(promises);
        }
      }
    } catch (error) {
      this.vm.$toast.create(10, error.message, this.delay);
    }
  }

  /**
   * Calls the API and stores the price data for a coin
   */
  async loadCoinPriceData(coin, attempts = 0) {
    const { selectedCurrency } = this.vm.$store.state.settings;
    const latestDay = Prices.find([`${coin}_${selectedCurrency.code}_day`]);
    const updateTime = 3600000;
    const currentTime = new Date().getTime();
    const updated = latestDay ? latestDay.updated - (latestDay.updated % updateTime) : null;
    if (!latestDay || currentTime - updated > updateTime) {
      const dayData = await this.getHistoricalData(coin, selectedCurrency.code, 'day', attempts);
      const weekData = await this.getHistoricalData(coin, selectedCurrency.code, 'week', attempts);
      const monthData = await this.getHistoricalData(coin, selectedCurrency.code, 'month', attempts);

      if (dayData && weekData && monthData) {
        this.storeChartData(coin, 'day', dayData.data);
        this.storeChartData(coin, 'week', weekData.data);
        this.storeChartData(coin, 'month', monthData.data);
      }
    }

    const latestPrice = await this.getPriceFeed(
      [coin],
      [selectedCurrency.code],
      attempts,
    );

    if (latestPrice) {
      const prices = latestPrice.data[0];
      this.storePriceData(coin, prices[selectedCurrency.code]);
    }
  }
}


export default ({ Vue }) => {
  Vue.prototype.BackEndService = BackEndService;
};
