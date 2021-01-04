<template>
  <div>
    <AccountSettings />
    <div class="settings-row">
      <div>
        Version
      </div>
      <div>
        {{ version }}
      </div>
    </div>
  </div>
</template>

<script>
import AccountSettings from '@/components/AccountSettings';
import { version } from '../../../package.json';

export default {
  name: 'Settings',
  components: {
    AccountSettings,
  },
  data() {
    return { version };
  },
};

</script>

<style scoped>

</style>
