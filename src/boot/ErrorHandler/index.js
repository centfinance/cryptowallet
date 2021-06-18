import Rollbar from 'vue-rollbar';
import { Notify } from 'quasar';

/**
 * Export plugin as vue prototype.
 * @param Vue
 */

export default ({ Vue, store }) => {
  Vue.use(Rollbar, {
    accessToken: 'ca78eb551a874473816f8a0cca63e226',
    autoInstrument: { dom: false },
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: true,
    source_map_enabled: false,
    // environment: 'development',
    payload: {
      client: {
        javascript: {
          code_version: '1.0',
        },
      },
    },
  });

  /**
   * Add an error handling callback that creates toast.
   * @param err
   * @param showToast
   * @param vm
   * @param info
   */
  Vue.config.errorHandler = (err, showToast = true) => {
    const accountId = store.state.settings.authenticatedAccount;
    const account = store.getters['entities/account/find'](accountId);

    if (account) {
      Vue.rollbar.configure({
        payload: {
          account: {
            name: account.name,
          },
        },
      });
    }

    Vue.rollbar.error(err);
    Vue.rollbar.info('HELLO WORLD');

    if (showToast) {
      const delay = 3000;
      Notify.create({
        message: err.message,
        position: 'bottom',
        color: 'negative',
        timeout: delay,
        icon: 'report_problem',
      });
      // this console.error is needed, otherwise we don't have debugging information, just a toast
      /* eslint-disable-next-line */
      console.error(err);
    }
  };

  Vue.prototype.errorHandler = Vue.config.errorHandler;
};
