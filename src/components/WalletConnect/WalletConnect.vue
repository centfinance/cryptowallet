<template>
  <div style="padding:5px;">
    <div
      v-if="connected"
      class="q-pa-md"
    >
      <div class="row items-center">
        <div class="col-2">
          <img
            height="35px"
            style="padding-right:10px"
            :src="peerMeta.icons[0]"
            :alt="peerMeta.name"
            class="sc-dIsAE dWzdfH"
          >
        </div>
        <div class="col-md-auto">
          {{ peerMeta.name }}
        </div>
      </div>

      <div class="row justify-start">
        <div class="col-1">
          <q-btn
            v-if="connected"
            size="xs"
            class="justify-left"
            color="primary"
            text-color="white"
            label="Disconnect"
            @click="killSession"
          />
        </div>
      </div>
    </div>
    <!-- </div> -->
    <div
      class="settings-row full-width row wrap"
    >
      <div
        v-if="!connected"
        class="full-width"
      >
        <div>
          <q-input
            v-model="address"
            label="Account"
            readonly
            filled
          />
        </div>
        <div class="col-12">
          <q-select
            v-model="token"
            standout="primary text-white"
            filled
            label="Select your wallet"
            outlined
            :value="token"
            :options="supportedNetworks"
            @change="val => { onValueChange }"
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
              >
                <q-item-section>
                  <q-item-label>
                    <span class="q-pl-sm ">
                      {{ scope.opt.label }}
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-12">
          <hr>
        </div>

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
            color="secondary"
            text-color="info"
            label="Connect"
            @click="openWalletConnect"
          />
        </div>
      </div>
      <div class="center-content-wrapper">
        <q-circular-progress
          v-if="loading"
          indeterminate
          size="40px"
          :thickness="0.4"
          font-size="50px"
          color="primary"
          track-color="grey-3"
          center-color="grey-8"
          class="q-ma-md"
        />
      </div>
      <div
        v-if="connected && !signTransaction && !personalSign"
        class="center-content-wrapper"
      >
        No incoming requests to approve/reject.
      </div>


      <div
        class="full-width"
        style="height:auto; padding:2px"
      >
        <!--Sign ETH -->
        <SignTransaction
          v-if="signTransaction"
          :pay-load="payLoad"
          :chain-id="chainId"
          :wallet="wallet"
        />
        <!--Personal Sign -->
        <PersonalSign
          v-if="personalSign"
          :pay-load="payLoad"
        />
        <div
          v-if="signTransaction || personalSign"
          class="row"
        >
          <q-card-actions
            align="right"
          >
            <q-btn
              size="sm"
              class="send-btn"
              color="secondary"
              text-color="info"
              label="Approve"
              @click="signEthereumRequests"
            />
            <q-btn
              size="sm"
              class="send-btn"
              color="primary"
              text-color="info"
              label="Reject"
              @click="reject"
            />
          </q-card-actions>
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
</template>

<script>
import { mapState } from 'vuex';
import * as ethers from 'ethers';
import Coin from '@/store/wallet/entities/coin';
import Wallet from '@/store/wallet/entities/wallet';

import SignTransaction from '@/components/WalletConnect/SignTransaction';
import PersonalSign from '@/components/WalletConnect/PersonalSign';
import WalletConnect from '@walletconnect/client';
import { convertHexToUtf8, convertHexToNumber } from '@walletconnect/utils';

export default {
  name: 'WalletConnect',
  components: {
    SignTransaction,
    PersonalSign,
  },
  props: {
    //
  },
  data() {
    return {
      showPeer: false,
      confirm: false,
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
        address: '',
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
      token: {
        label: 'Ethereum',
        value: 'ETHEREUM',
      },
    };
  },
  computed: {
    ...mapState({
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      delay: (state) => { return state.settings.delay; },
      scannedURI: (state) => { return state.qrcode.scannedURI; },

    }),
    showPeerMeta() {
      return true;
    },
    supportedNetworks() {
      const networks = Coin.query()
        .where('sdk', 'Ethereum')
        .get();
      if (this.demoMode) {
        return networks.filter(({ testnet }) => { return testnet; }).map((coin) => {
          return {
            label: coin.name,
            value: coin.network,
          };
        });
      }
      if (!this.showTestnets) {
        return networks.filter(({ testnet }) => { return testnet; }).map((coin) => {
          return {
            label: coin.name,
            value: coin.network,
          };
        });
      }
      return networks.map((coin) => {
        return {
          label: coin.name,
          value: coin.network,
        };
      });
    },
    wallet() {
      return Wallet.query()
        .where('account_id', this.authenticatedAccount)
        .where('name', this.token.label)
        .get()[0];
    },
    address() {
      if (this.wallet) {
        return this.coinSDKS.Ethereum(this.token.value)
          .generateKeyPair(this.wallet.hdWallet, 0).address;
      }
      return null;
    },
    chainId() {
      if (this.wallet) {
        return this.coinSDKS.Ethereum(this.token.value)
          .generateKeyPair(this.wallet.hdWallet, 0).network.chainId;
      }
      return null;
    },
    networkName() {
      if (this.wallet) {
        return this.coinSDKS.Ethereum(this.token.value)
          .generateKeyPair(this.wallet.hdWallet, 0).network.name;
      }
      return null;
    },
    walletConnectModalOpened: {
      get() {
        // this.openWalletConnect();
        return this.$store.state.modals.walletConnectModalOpened;
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
  mounted() {
    const session = this.getCachedSession();
    if (session) {
      this.connector = new WalletConnect({ session });
      // eslint-disable-next-line no-underscore-dangle
      this.connected = this.connector._connected;
      // eslint-disable-next-line no-underscore-dangle
      if (!this.connector || this.connector._peerMeta == null) {
        this.killSession();
      } else {
        // eslint-disable-next-line no-underscore-dangle
        this.peerMeta = this.connector._peerMeta;
        const address = this.connector.accounts[0];
        this.activeIndex = this.connector.accounts.indexOf(address);
        this.subscribeToEvents();
      }
    }
  },
  methods: {
    onValueChange() {
    },
    approveSession() {
      const cId = this.chainId;
      const accounts = [this.address];
      if (this.connector) {
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
    },
    resetApp() {
      this.connected = false;
      this.connector = null;
      this.signTransaction = false;
      this.personalSign = false;
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
    async openWalletConnect() {
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
          console.log(payload);
          if (error) {
            throw error;
          }
          if (payload.params[0].peerId === '') { this.killSession(); }
          this.personalSign = false;
          this.signTransaction = false;

          this.connected = true;
          this.uri = '';
        });

        this.connector.on('disconnect', (error, payload) => {
          console.log(payload);

          if (error) {
            throw error;
          }
          this.resetApp();
        });

        if (this.connector.connected) {
          console.log('Wallet connected:');
        }
      }
    },
    renderWalletConnectRequest(payload) {
      this.payLoad.id = payload.id;
      this.payLoad.method = payload.method;
      this.$store.dispatch('settings/setWalletConnectRequestStatus', true);
      switch (payload.method) {
        case 'eth_sendTransaction':
        case 'eth_signTransaction':
          this.payLoad.from = payload.params[0].from;
          this.payLoad.to = payload.params[0].to;
          // eslint-disable-next-line no-nested-ternary
          this.payLoad.gasLimit = payload.params[0].gas ? convertHexToNumber(payload.params[0].gas) : payload.params[0].gasLimit ? convertHexToNumber(payload.params[0].gasLimit) : '';
          // eslint-disable-next-line no-case-declarations
          const g = 10000000000000;
          // eslint-disable-next-line max-len
          this.payLoad.gasPrice = payload.params[0].gasPrice ? convertHexToNumber(payload.params[0].gasPrice) : g;
          this.payLoad.nonce = payload.params[0].nonce ? convertHexToNumber(payload.params[0].nonce) : '';
          this.payLoad.value = payload.params[0].value ? convertHexToNumber(payload.params[0].value) : '';
          this.payLoad.data = payload.params[0].data;
          // eslint-disable-next-line prefer-destructuring
          this.payLoad.transaction = payload.params[0];
          this.signTransaction = true;
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
      if (this.wallet) {
        const { transaction } = this.payLoad;
        const { signer } = this.wallet;
        if (
          transaction.from.toLowerCase() !== this.wallet.address.toLowerCase()
        ) {
          console.error("Transaction request From doesn't match active account");
          return null;
        }

        if (transaction.from) {
          delete transaction.from;
        }

        // ethers.js expects gasLimit instead
        if ('gas' in transaction) {
          transaction.gasLimit = transaction.gas;
          delete transaction.gas;
        }

        const result = await signer.sendTransaction(transaction);
        return result.hash;
      }
      return null;
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
