<template>
  <div
    v-if="!online"
    class="bg-offline"
  />
</template>

<script>
import { mapState } from 'vuex';
import { Network } from '@/helpers';

export default {
  name: 'OfflineNotice',
  data() {
    return {
      online: null,
      dismiss: null,
      onlineInterval: null,
    };
  },
  computed: {
    ...mapState({
      delay: (state) => { return state.settings.delay; },
    }),
  },
  mounted() {
    try {
      this.network = new Network(this.$q.platform.is);
      this.online = this.network.isOnline();
      if (!this.online) {
        this.online = false;
        if (!this.dismiss) {
          this.showOfflineNotice();
        }
      }

      this.network
        .on('offline', () => {
          this.online = false;
          if (!this.dismiss) {
            this.showOfflineNotice();
          }
        })
        .on('online', () => {
          this.online = true;
          if (this.dismiss) {
            this.dismiss();
            this.dismiss = null;
          }
        });

      this.onlineInterval = setInterval(() => {
        if (this.online === false) {
          if (this.network.isOnline()) {
            this.online = true;
            this.dismiss();
          }
        }
      }, this.delay.vlong);
    } catch (error) {
      this.errorHandler(error);
    }
  },
  beforeDestroy() {
    if (this.onlineInterval) { clearInterval(this.onlineInterval); }
  },
  methods: {
    showOfflineNotice() {
      this.dismiss = this.$q.notify({
        message: this.$t('noConnection'),
        timeout: 0,
        color: 'negative',
        position: 'top',
        closeBtn: false,
        onDismiss() {
          this.dismiss = null;
        },
      });
    },
  },
};
</script>

<style>
.bg-offline {
  height: 100vh;
  width: 100vw;
  background: rgba(0,0,0,5);
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  z-index: 2001;
  top: 0;
  left: 0;
  display: none;
}

.bg-offline .q-alert-content {
  font-size: 0.8rem;
}

.bg-offline .q-alert {
  margin-top: 1rem;
  transition: all ease-in-out 150ms;
  opacity: 1;
}

.bg-offline .q-alert {
  max-width: 18rem;
}

</style>
