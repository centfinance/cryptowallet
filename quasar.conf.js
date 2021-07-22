/* eslint-disable */
const envparser = require('./config/envparser');
const path = require('path');

module.exports = (ctx) => {
  return {
    boot: [
      'i18n',
      'CWCrypto',
      'VuexRouterSync',
      'Toaster',
      'ErrorHandler',
      'CryptoWalletSDK',
      'WalletDiscovery',
      'VueTrend',
      'VueSelect',
      'Vuelidate',
      'BackEndService',
      'AccountInitializer',
      'ENS',
      'Magic',
      'Notify',
      'WebQRScanner',
      'VClipboard',
    ],
    css: ['app.styl'],
    extras: [
      'roboto-font',
      'material-icons',
      'fontawesome-v5'
    ],
    supportIE: false,
    build: {
      scopeHoisting: true,

      extendWebpack(cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
        });
        
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          '@': path.resolve(__dirname, './src/'),
        };
      },
      chainWebpack: config => {
        config.output
          .globalObject('this')
        /* ... */
      },
      uglifyOptions: {
        mangle: false,
      },
      env: envparser(),
    },
    devServer: {
      open: true,
    },
    framework: {
      config: {
        dark: false,
      },
      components: [
        'QLayout',
        'QHeader',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QBtnGroup',
        'QBtn',
        'QIcon',
        'QList',
        'QItem',
        'QItemSection',
        'QItemLabel',
        'QPageSticky',
        'QScrollArea',
        'QFooter',
        'QInput',
        'QTabs',
        'QTab',
        'QTabPanels',
        'QTabPanel',
        'QRouteTab',
        'QPullToRefresh',
        'QTimeline',
        'QTimelineEntry',
        'QInfiniteScroll',
        'QSpinnerDots',
        'QExpansionItem',
        'QDialog',
        'QToggle',
        'QRadio',
        'QSelect',
        'QSlider',
        'QScrollObserver',
        'QBanner',
        'QCarousel',
        'QCarouselSlide',
        'QCarouselControl',
        'QCheckbox',
        'QCard',
        'QCardSection',
        'QCardActions',
        'QSlideItem',
        'QAvatar',
        'QInnerLoading',
        'QSpinner',
        'QCircularProgress',
        'QBadge',
        'QChip',
        'QSpace',
        'QSlideTransition',
        'QSeparator'
      ],
      directives: ['Ripple', 'ClosePopup', 'ClosePopup'],
      // Quasar plugins
      plugins: ['Notify', 'Dialog', 'BottomSheet', 'AppVisibility'],
      // iconSet: 'material-icons',
      lang: 'en-gb',
    },
    // animations: 'all' --- includes all animations
    animations: ['slideInUp', 'slideOutDown'],
    cordova: {
      id: 'com.cent.mobile.wallet',
      iosStatusBarPadding: false,
    },
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {}, // only for NON InjectManifest
      manifest: {
        name: 'Cent',
        short_name: 'Cent',
        description: 'The crypto wallet for DeFi',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            'src': 'statics/icons/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ]
      }
    }
  };
};
 