<template>
  <q-dialog
    v-model="walletConnectModalOpened"
    :maximized="false"
    transition-show="slide-up"
    transition-hide="slide-down"
    content-class="dark-modal"
  >
    <q-card
      class="full-width"
      style="height: 80%; width:100%"
    >
      <div style="padding:5px;">
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
            Wallet Connect
          </h1>
        </div>

        <q-card-section
          v-if="connected"
          class="row items-center no-wrap"
        >
          <q-item
            v-ripple
            clickable
          >
            <q-item-section side>
              <q-avatar
                rounded
              >
                <img
                  :src="peerMeta.icons[0]"
                  :alt="peerMeta.name"
                >
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label> {{ peerMeta.name }}</q-item-label>
              <q-item-label caption>
                {{ peerMeta.description }}
              </q-item-label>
              <q-item-label caption>
                {{ peerMeta.url }} - <q-btn
                  v-if="connected"
                  size="xs"
                  rounded
                  icon="fas fa-times"
                  color="red"
                  text-color="white"
                  @click="killSession"
                />
              </q-item-label>
            </q-item-section>
          </q-item>
          <!-- <div>
            <div class="text-weight-bold">
              {{ peerMeta.name }}
            </div>
            <div class="text-grey">
              {{ peerMeta.description }}
            </div>
          </div>

          <q-space />

          <img
            height="35px"
            style="padding-right:10px"
            :src="peerMeta.icons[0]"
            :alt="peerMeta.name"
            class="sc-dIsAE dWzdfH"
          >
          <q-btn
            v-if="connected"
            size="xs"
            class="justify-left"
            color="primary"
            text-color="white"
            label="Disconnect"
            @click="killSession"
          /> -->
        </q-card-section>
        <!-- <q-card-section class="row full-width items-center">
        </q-card-section> -->
        <q-card-section
          v-if="connected"
          class="row items-center no-wrap"
        >
          <SignTransaction
            v-if="signTransaction"
            :pay-load="payLoad"
            :chain-id="chainId"
          />
          <!--Personal Sign -->
          <PersonalSign
            v-if="personalSign"
            :pay-load="payLoad"
          />
        </q-card-section>
        <q-card-actions v-if="signTransaction || personalSign">
          <q-btn
            label="Approve"
            color="primary"
            flat
            :loading="loading"
            @click="signEthereumRequests"
          />
          <q-btn
            label="Reject"
            color="secondary"
            flat
            @click="reject"
          />
        </q-card-actions>
        <!-- </div> -->
        <div
          class="settings-row full-width row wrap"
        >
          <div
            v-if="!connected"
            class="full-width"
          >
            <div class="to col-8">
              <q-input
                v-model="uri"
                label="URI"
                class="sm-input full-width address-input"
                bottom-slots
                outlined
                dense
                color="primary"
              />
              <div
                class="side-content qr-code-wrapper"
                @click="scan"
              >
                <div class="hor-line" />
                <div class="ver-line" />
                <img src="~assets/QR.svg">
              </div>
            </div>
            <div class="col">
              <q-btn
                :loading="loading"
                color="primary"
                text-color="white"
                label="Go"
                @click="OpenSession"
              />
            </div>
          </div>
        </div>

        <!-- <div > -->

        <q-dialog
          v-model="confirm"
          persistent
        >
          <q-card v-bind="peerMeta">
            <q-card-section class="row items-center">
              <q-list
                padding
              >
                <q-item>
                  <q-item-section
                    top
                    avatar
                  >
                    <q-avatar color="primary">
                      <img
                        :src="peerMeta.icons[0]"
                        class="sc-dIsAE dWzdfH"
                        width="50px"
                      >
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ peerMeta.name }}</q-item-label>
                    <q-item-label
                      caption
                      lines="2"
                    >
                      <u>{{ peerMeta.url }}</u> is trying to connect to your wallet.
                    </q-item-label>
                  </q-item-section>

                <!-- <q-item-section side top>
          <q-item-label caption>5 min ago</q-item-label>
          <q-icon name="star" color="yellow" />
        </q-item-section> -->
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-card-actions align="right">
                      <q-btn
                        v-close-popup
                        flat
                        label="Reject"
                        color="primary"
                        @click="rejectSession"
                      />
                      <q-btn
                        v-close-popup
                        flat
                        label="Approve"
                        color="primary"
                        @click="approveSession"
                      />
                    </q-card-actions>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-dialog>
      <!-- </div> -->
      <!-- </q-dialog> -->
      </div>
      <!-- <q-list
        v-for="request in requests"
        :key="request.id"
      >
        <q-item>
          {{ request.method }}
        </q-item>
      </q-list> -->
    </q-card>
  </q-dialog>
</template>

<script>
import { mapState } from 'vuex';
import * as ethers from 'ethers';
import * as Web3 from 'web3';
import WalletConnect from '@walletconnect/client';
import { convertHexToUtf8 } from '@walletconnect/utils';
import Wallet from '@/store/wallet/entities/wallet';

import SignTransaction from '@/components/WalletConnect/SignTransaction';
import PersonalSign from '@/components/WalletConnect/PersonalSign';

export default {
  name: 'WalletConnect',
  components: {
    SignTransaction,
    PersonalSign,
  },
  data() {
    return {
      showPeer: false,
      confirm: false,
      address: null,
      chainId: null,
      payLoad: {
        data: '',
        from: '',
        gas: '',
        gasPrice: '',
        nonce: '',
        to: '',
        value: '',
        id: '',
        raw: '',
        message: '',
        method: '',
        transaction: Object,
      },
      dataToSign: '',
      loading: false,
      signTransaction: false,
      personalSign: false,
      connected: false,
      uri: '',
      peerMeta: {
        description: '', url: '', icons: [''], name: 'Balasssncer',
      },
      connector: WalletConnect,
      requests: [],
    };
  },
  computed: {
    ...mapState({
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      delay: (state) => { return state.settings.delay; },
      scannedURI: (state) => { return state.qrcode.scannedURI; },
      walletConnectPayload: (state) => { return state.settings.walletConnectPayload; },

    }),
    showPeerMeta() {
      return true;
    },
    wallet() {
      return Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .where('externalAddress', this.address)
        .where('enabled', true)
        .where('chainId', this.chainId)
        .get()[0];
    },
    walletConnectModalOpened: {
      get() {
        const payLoad = this.$store.state.modals.walletConnectModalOpened;
        if (!payLoad) { return false; }
        if (!this.connector) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.chainId = payLoad.chainId;
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.address = payLoad.address;
        }
        return true;
      },
      set(value) {
        this.$store.dispatch('modals/setWalletConnectModalOpened', value);
      },
    },
  },
  beforeDestroy() {
    // this.refreshPrices();
    this.loading = false;
  },
  async mounted() {
    const session = this.getCachedSession();
    if (session) {
      this.connector = new WalletConnect({ session });
      // eslint-disable-next-line no-underscore-dangle
      this.connected = this.connector._connected;
      // eslint-disable-next-line no-underscore-dangle
      if (!this.connector || this.connector._peerMeta == null) {
        this.killSession();
      } else {
        this.setUp();
        this.subscribeToEvents();
      }
    }
  },
  methods: {
    setUp() {
      if (this.connector) {
        // eslint-disable-next-line no-underscore-dangle
        this.peerMeta = this.connector._peerMeta;
        const a = this.connector.accounts[0];
        this.address = a;
        this.chainId = this.connector.chainId;
        this.$root.$emit('walletConnected', { chainId: this.chainId });
      }
    },
    approveSession() {
      const cId = this.walletConnectPayload.chainId;
      const accounts = [this.walletConnectPayload.address];
      console.log(`Approve: ${accounts}`);
      if (this.connector && this.address !== null) {
        this.connector.approveSession({ accounts, chainId: cId });
      }
      this.connected = true;
    },
    rejectSession() {
      if (this.connector) {
        this.loading = false;
        this.uri = '';
        this.connector.rejectSession();
      }
    },
    killSession() {
      if (this.connector) {
        this.connector.killSession();
        this.connector = null;
      }
      this.resetApp();
      this.closeModal();
    },
    resetApp() {
      this.connected = false;
      this.connector = null;
      this.signTransaction = false;
      this.loading = false;
      this.uri = '';
      this.personalSign = false;
      this.$store.dispatch('settings/setWalletConnectPayload', null);
      this.$store.dispatch('settings/setWalletConnectRequestStatus', false);
    },
    showModal() {
      this.confirm = true;
    },
    getCachedSession() {
      const local = localStorage ? localStorage.getItem('walletconnect') : null;

      let session = null;
      if (local) {
        try {
          session = JSON.parse(local);
        } catch (error) {
          throw error;
        }
      }
      return session;
    },
    async OpenSession() {
      const { uri } = this;
      try {
        this.connector = new WalletConnect({ uri });
        this.loading = true;
        if (!this.connector.connected) {
          await this.connector.createSession();
        }
        this.subscribeToEvents();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    },
    subscribeToEvents() {
      if (this.connector) {
        this.connector.on('session_request', (error, payload) => {
          if (error) {
            throw error;
          }

          // eslint-disable-next-line prefer-destructuring
          this.peerMeta = payload.params[0].peerMeta;
          this.showModal();
        });

        this.connector.on('session_update', (error) => {
          if (error) {
            throw error;
          }
        });

        this.connector.on('call_request', async (error, payload) => {
          this.setUp();
          this.requests.push(payload);
          switch (payload.method) {
            case 'eth_sendTransaction':
            case 'eth_signTransaction':

              this.renderWalletConnectRequest(payload);
              break;
            case 'personal_sign':
              this.renderWalletConnectRequest(payload);
              break;

            default:
              break;
          }
          if (error) {
            throw error;
          }
        });

        this.connector.on('connect', (error, payload) => {
          this.loading = false;
          if (error) {
            throw error;
          }
          if (payload.params[0].peerId === '') { this.killSession(); }
          this.personalSign = false;
          this.signTransaction = false;

          this.connected = true;
          this.uri = '';
          this.setUp();
        });

        this.connector.on('disconnect', (error, payload) => {
          console.log(payload);

          if (error) {
            throw error;
          }
          this.resetApp();
        });

        if (this.connector.connected) {
          // console.log('Wallet connected:');
        }
      }
    },
    renderWalletConnectRequest(payload) {
      this.payLoad.id = payload.id;
      this.payLoad.method = payload.method;
      // this.$store.dispatch('settings/setWalletConnectRequestStatus', true);
      switch (payload.method) {
        case 'eth_sendTransaction':
        case 'eth_signTransaction':
          this.payLoad.from = payload.params[0].from;
          this.payLoad.to = payload.params[0].to;
          // eslint-disable-next-line no-nested-ternary
          this.payLoad.gasLimit = payload.params[0].gas ? ethers.BigNumber.from(payload.params[0].gas).toHexString() : payload.params[0].gasLimit ? ethers.BigNumber.from(payload.params[0].gasLimit).toHexString() : '';
          // eslint-disable-next-line no-case-declarations
          const g = 10000000000000;
          // eslint-disable-next-line max-len
          this.payLoad.gasPrice = payload.params[0].gasPrice ? ethers.BigNumber.from(payload.params[0].gasPrice).toHexString() : g;
          this.payLoad.nonce = payload.params[0].nonce ? ethers.BigNumber.from(payload.params[0].nonce).toHexString() : '';
          this.payLoad.value = payload.params[0].value ? ethers.BigNumber.from(payload.params[0].value).toHexString() : '';
          this.payLoad.data = payload.params[0].data;
          // eslint-disable-next-line prefer-destructuring
          this.payLoad.transaction = payload.params[0];
          this.signTransaction = true;
          this.$store.dispatch('modals/setWalletConnectModalOpened', { open: true, chainId: this.chainId, address: this.address });
          break;

        case 'personal_sign':
          this.payLoad.id = payload.id;
          // eslint-disable-next-line no-case-declarations
          const [message, address] = payload.params;
          this.payLoad.address = address;
          this.payLoad.message = this.convertHexToUtf8IfPossible(message);
          this.dataToSign = message;
          this.personalSign = true;
          break;
        default:
          break;
      }
    },
    closeModal() {
      // this.refreshPrices();
      this.loading = false;
      // if not connected then reset app
      if (this.getCachedSession() === null) {
        this.$store.dispatch('settings/setWalletConnectPayload', null);
      }
      this.walletConnectModalOpened = false;
    },
    async signEthereumRequests() {
      const errorMsg = '';
      let result = null;

      if (this.connector && this.connector.connected) {
        switch (this.payLoad.method) {
          case 'eth_sendTransaction':
          case 'eth_signTransaction':
            result = await this.approveTransaction();
            this.signTransaction = false;
            this.loading = false;
            break;
          case 'personal_sign':
            result = await this.signPersonalMessage();
            this.signTransaction = false;
            this.personalSign = false;
            break;

          default:
            console.log(`Method not supported: ${this.payLoad.method}`);
            break;
        }
        if (result) {
          this.connector.approveRequest({ id: this.payLoad.id, result });
          this.$store.dispatch('settings/setWalletConnectRequestStatus', false);
          this.closeModal();
        } else {
          let message = 'JSON RPC method not supported';
          this.$store.dispatch('settings/setWalletConnectRequestStatus', false);
          if (errorMsg) {
            message = errorMsg;
          }
          this.reject(message);
        }
      }
    },
    async approveTransaction() {
      this.loading = true;

      const { transaction } = this.payLoad;
      if (this.getWallet()) {
        // NEW CHANGE
        const pKey = this.getKeyFromHDWallet();

        // if (transaction.from) {
        //   delete transaction.from;
        // }
        // hardcode value in case of celo?
        // transaction.value = '00000000001';

        // ethers.js expects gasLimit instead
        if ('gas' in transaction) {
          transaction.gasLimit = transaction.gas;
          delete transaction.gas;
        }
        const web3 = new Web3(this.getWallet().hdWallet.network.provider);
        const newWallet = await web3.eth.accounts.privateKeyToAccount(pKey);
        web3.eth.accounts.wallet.add(pKey);
        web3.eth.defaultAccount = newWallet.address;

        const result = await web3.eth.sendTransaction(transaction);
        // console.log(`RESULT: ${JSON.stringify(result)}`);
        return result.transactionHash;
      }
      return null;
    },
    getWallet() {
      return Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .where('externalAddress', this.address)
        .where('enabled', true)
        .where('chainId', this.chainId)
        .get()[0];
    },
    getKeyFromHDWallet() {
      if (this.wallet.network === 'CELO' || this.wallet.network === 'CELO_ALFAJORES') {
        const coinSDK = this.coinSDKS[this.wallet.sdk](this.wallet.network);
        const keypair = coinSDK.generateKeyPair(this.wallet.hdWallet, 0);
        return keypair.privateKey;
      }
      return this.coinSDKS.Ethereum(this.wallet.network)
        .generateKeyPair(this.wallet.hdWallet, 0).privateKey;
    },
    async signPersonalMessage() {
      if (this.wallet) {
        const { signer } = this.wallet;
        const result = await signer.signMessage(
          // eslint-disable-next-line max-len
          ethers.utils.isHexString(this.dataToSign) ? ethers.utils.arrayify(this.dataToSign) : this.dataToSign,
        );
        return result;
      }
      return null;
    },
    async signMessage() {
      const signingKey = new ethers.utils.SigningKey(this.wallet.privateKey);
      const sigParams = await signingKey.signDigest(ethers.utils.arrayify(this.dataToSign));
      const result = await ethers.utils.joinSignature(sigParams);
      return result;
    },
    convertHexToUtf8IfPossible(hex) {
      try {
        return convertHexToUtf8(hex);
      } catch (e) {
        return hex;
      }
    },
    reject(message = 'User Rejected') {
      this.signTransaction = false;
      this.personalSign = false;
      this.$store.dispatch('settings/setWalletConnectRequestStatus', false);
      this.connector.rejectRequest({ id: this.payLoad.id, error: { message } });
      this.closeModal();
      return false;
    },
    scan() {
      if (typeof QRScanner !== 'undefined') {
        return this.scanNative();
      }
      return this.scanWeb();
    },
    /**
     * Initiates the QR code scanner
     */
    scanNative() {
      this.$store.dispatch('qrcode/scanQRCode');
      this.walletConnectModalOpened = false;
      if (typeof QRScanner !== 'undefined') {
        setTimeout(() => {
          const scanQR = () => {
            return QRScanner.scan((err, text) => {
              if (err) {
                this.errorHandler(err);
              } else {
                this.uri = text;
                this.$store.dispatch('qrcode/setScannedURI', text);
                this.codeReader.reset();
                this.$store.dispatch('qrcode/cancelScanning');
                this.walletConnectModalOpened = true;
              }
            });
          };
          scanQR();
        }, this.delay.normal);
      }
    },

    scanWeb() {
      this.$store.dispatch('qrcode/scanQRCode');
      this.walletConnectModalOpened = false;
      setTimeout(() => {
        const scanQR = () => {
          this.codeReader
            .decodeOnceFromVideoDevice(undefined, 'video')
            .then((result) => {
              const { text } = result;
              this.uri = text;
              this.$store.dispatch('qrcode/setScannedURI', text);
              this.codeReader.reset();
              this.$store.dispatch('qrcode/cancelScanning');
              this.walletConnectModalOpened = true;
            })
            .catch((err) => {
              return this.errorHandler(err);
            });
          this.codeReader.reset();
        };
        scanQR();
      }, this.delay.normal);
    },
  },
};
</script>

<style>
</style>
