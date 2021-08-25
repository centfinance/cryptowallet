<template>
  <section
    class="main-nav"
  >
    <div class="">
      <router-link
        class="main-nav-link"
        to="/wallet"
      >
        <q-icon name="account_balance_wallet" />
        <div>{{ $t('wallets') }}</div>
      </router-link>
    </div>
    <div class="text-center">
      <img
        v-if="dark"
        style="Opacity:.7"
        class="header-logo q-mt-xs"
        src="~/assets/cent-logo-white.svg"
      >
      <img
        style="opacity:.7"
        v-else
        class="header-logo q-mt-xs"
        src="~/assets/cent-logo-black.svg"
      >
    </div>
    <div class="">
      <router-link
        class="main-nav-link"
        to="/settings"
      >
        <q-icon name="settings" />
        <div>{{ $t('settings') }}</div>
      </router-link>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MainNav',
  computed: {
    dark() {
      return this.$q.dark.isActive;
    },
    wcRequestPending() {
      return this.$store.state.settings.wcRequestPending;
    },
  },
};
</script>

<style lang="stylus" scoped>
  .main-nav {
    width: 100%;
    height: 4rem;
    background: white;
    border-top: 1px solid lightgrey;
    display: flex;
    justify-content: space-between;
  }

  body.body--dark .main-nav {
    background: black;
    border-top: 1px solid $grey-9;
  }

  .main-nav > div {
    flex: 1;
  }

  .main-nav-link {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: slategrey;
    width: 100%;
    font-family: 'Inter-Medium';
    height: 100%;
    text-decoration: none;
  }

  body.body--dark .main-nav-link {
    color: lightgrey;
  }

  .main-nav-link i {
    font-size: 2em;
    margin-bottom: 0.2em;
  }

  .main-nav-link > div {
    font-size: 0.8rem;
  }

  .router-link-exact-active {
    color: $primary!important;
    font-family: 'Inter-Medium';
  }

  .svg-icon {
    width: 100%;
    height: 4rem;
    line-height: 0;
    display: flex;
  }

  .svg-icon img {
    max-width: 75%;
    margin: 0 auto;
  }
</style>
