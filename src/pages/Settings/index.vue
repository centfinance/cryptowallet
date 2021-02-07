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
    <div class="settings-row">
      <div>Contact Us</div>
      <div>
        <q-item
          tag="a"
          href="mailto:hi@cent.finance"
          clickable
        >
          <q-item-section>
            <q-item-label>hi@cent.finance</q-item-label>
          </q-item-section>
        </q-item>
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
