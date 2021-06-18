<template>
  <div class="fixed-bottom q-ma-md">
    <!-- <h1 class="setup">
      {{ $t('pinSetupTitle') }}
    </h1> -->
    <h4 class="setup">
      {{ $t('setupPin') }}
    </h4>
    <PinPad mode="pin-setup" />
  </div>
</template>

<script>
import PinPad from '@/components/Auth/PinPad';

export default {
  name: 'Pin',
  components: {
    PinPad,
  },
};
</script>

<style scoped>

</style>
