<template>
  <div v-if="account">
    <!-- <div
      class="settings-row"
      @click.prevent="openSelectLanguageModal"
    >
      <div>
        {{ $t('language') }}
      </div>
      <div>
        <q-btn
          icon="chevron_right"
          size="lg"
          color="blueish"
          class="settings-chevron"
          flat
          @click.prevent="openSelectLanguageModal"
        />
      </div>
    </div> -->

    <div
      class="settings-row"
      @click.prevent="openSelectCurrencyModal"
    >
      <div>
        {{ $t('currency') }}
      </div>
      <div>
        <q-btn
          icon="chevron_right"
          size="lg"
          color="info"
          class="settings-chevron"
          flat
          @click.prevent="openSelectCurrencyModal"
        />
      </div>
    </div>

    <div
      v-if="email"
      class="settings-row"
      @click.prevent="openUpdateEmailModal"
    >
      <div>
        {{ $t('updateEmail') }}
      </div>
      <div>
        <q-btn
          icon="chevron_right"
          size="lg"
          color="info"
          class="settings-chevron"
          flat
          @click.prevent="openUpdateEmailModal"
        />
      </div>
    </div>

    <div
      class="settings-row"
      @click.prevent="openNewPinModal"
    >
      <div>
        {{ $t('pinCode') }}
      </div>
      <div>
        <q-btn
          icon="chevron_right"
          size="lg"
          color="info"
          class="settings-chevron"
          flat
          @click.prevent="openNewPinModal"
        />
      </div>
    </div>
    <div
      class="settings-row"
      @click.prevent="openExportKeysModal"
    >
      <div>
        {{ $t('viewKeys') }}
      </div>
      <div>
        <q-btn
          icon="chevron_right"
          size="lg"
          color="info"
          class="settings-chevron"
          flat
          @click.prevent="openExportKeysModal"
        />
      </div>
    </div>
    <ToggleTestnets v-if="!demoMode && !isCelo" />
    <SwitchWallet />
    <ToggleDarkMode v-if="!isCelo" />
    <div
      class="settings-row"
      @click="logout"
    >
      <div>
        {{ $t('logout') }}
      </div>
      <div>
        <q-btn
          icon="chevron_right"
          size="lg"
          color="info"
          class="settings-chevron"
          flat
          @click="logout"
        />
      </div>
    </div>


    <div
      class="settings-row"
      @click.prevent="openDeleteAccountModal"
    >
      <div>
        {{ $t('deleteAccount') }}
      </div>
      <div>
        <q-btn
          icon="chevron_right"
          size="lg"
          color="info"
          class="settings-chevron"
          flat
          @click.prevent="openDeleteAccountModal"
        />
      </div>
    </div>

    <!-- <SelectLanguage
      :current-locale="account.locale"
    /> -->

    <SelectCurrency
      v-if="account"
      :current-currency="account.currency"
    />

    <Pin
      v-if="account"
      :pin-hash="account.pinHash"
    />

    <DeleteAccount
      v-if="account"
      :pin-hash="account.pinHash"
    />
    <UpdateEmail v-if="updateEmailEnabled" />
    <ExportKeys v-if="exportKeysEnabled" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
// import SelectLanguage from '@/components/AccountSettings/SelectLanguage';
import SelectCurrency from '@/components/AccountSettings/SelectCurrency';
import Pin from '@/components/AccountSettings/Pin';
import DeleteAccount from '@/components/AccountSettings/DeleteAccount';
import ToggleTestnets from '@/components/AccountSettings/ToggleTestnets';
import ToggleDarkMode from '@/components/AccountSettings/ToggleDarkMode';
import SwitchWallet from '@/components/AccountSettings/SwitchWallet';
import UpdateEmail from '@/components/AccountSettings/UpdateEmail';
import ExportKeys from '@/components/AccountSettings/ExportKeys';


export default {
  name: 'AccountSettings',
  components: {
    // SelectLanguage,
    SelectCurrency,
    Pin,
    DeleteAccount,
    ToggleTestnets,
    ToggleDarkMode,
    SwitchWallet,
    UpdateEmail,
    ExportKeys,
  },
  computed: {
    ...mapState({
      authenticatedAccount: (state) => { return state.settings.authenticatedAccount; },
      selectedAccount: (state) => { return state.settings.selectedAccount; },
      walletType: (state) => { return state.settings.walletType; },
    }),
    account() {
      return this.$store.getters['entities/account/find'](this.authenticatedAccount);
    },
    email() {
      if (this.account && this.account.email) { return this.account.email; }
      return null;
    },
    isCelo() {
      if (this.walletType === 'celo') { return true; }
      return false;
    },
    demoMode() {
      if (this.account) { return this.account.demoMode; }
      return null;
    },
    updateEmailEnabled() {
      return this.$store.state.modals.updateEmailModalOpened;
    },
    exportKeysEnabled() {
      return this.$store.state.modals.exportKeysModalOpened;
    },
  },
  methods: {
    openSelectCurrencyModal() {
      this.$store.dispatch('modals/setSelectCurrencyModalOpened', true);
    },
    openSelectLanguageModal() {
      this.$store.dispatch('modals/setSelectLanguageModalOpened', true);
    },
    openDeleteAccountModal() {
      this.$store.dispatch('modals/setDeleteAccountModalOpened', true);
    },
    openNewPinModal() {
      this.$store.dispatch('modals/setNewPinModalOpened', true);
    },
    openUpdateEmailModal() {
      this.$store.dispatch('modals/setUpdateEmailModalOpened', true);
    },
    openExportKeysModal() {
      this.$store.dispatch('modals/setExportKeysModalOpened', true);
    },
    logout() {
      window.location.reload(true);
    },
  },
};
</script>

<style>
.settings-row {
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid whitesmoke;
  height: 3.5rem;
  display: flex;
  align-items: center;
  font-family: 'Inter-Medium';
}
body.body--dark .settings-row {
  border-bottom: 1px solid #424242;
}

.settings-chevron {
  height: 2em!important;
  min-height: auto;
  padding: 0;
  padding-left: 2em;
  position: relative;
  right: -0.25em;
}

.settings-chevron .q-btn__content {
  justify-content: flex-end;
}

</style>
