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
          <q-item-section no-wrap>
            <q-item-label><q-icon name="fa fa-envelope" />  hi@cent.finance</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
    <div class="settings-row">
      <div>Follow Cent</div>
      <div>
        <q-item
          tag="a"
          href="https://twitter.com/cent_finance"
          clickable
        >
          <q-item-section>
            <q-btn
              icon="fab fa-twitter"
              size="md"
              color="grey"
              flat
            />
          </q-item-section>
        </q-item>
      </div>
    </div>
    <div class="settings-row">
      <div>Join the discussion</div>
      <div>
        <q-item
          tag="a"
          href="https://discord.gg/mYxjMbdVvq"
          clickable
        >
          <q-item-section>
            <q-btn
              icon="fab fa-discord"
              size="md"
              color="grey"
              flat
            />
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
