<template>
  <div>
    <!-- <div class="q-gutter-sm"> -->
    <q-carousel
      v-if="cList"
      v-model="slide"
      transition-prev="scale"
      transition-next="scale"
      swipeable
      :autoplay="9500"
      position="bottom-left"
      animated
      control-color="primary"
      navigation
      padding
      infinite
      height="200px"
      style="background:#1D1D1D !important;opacity:.8"
      class="text-white q-pt-md shadow-1"
    >
      <q-carousel-slide
        v-for="c in cList"
        :key="c.icon"
        :name="c.icon"
        style="padding"
        class="column no-wrap q-pb-xs q-pt-lg flex-center"
      >
        <div class="q-mt-md text-center">
          <!-- <hr v-if="c.link" style="opacity: .5" width="100%"> -->
          <q-icon
            :name="c.icon"
            color="secondary"
            size="22px"
          />&nbsp;
          {{ c.content }}
          <hr
            v-if="c.link"
            style="opacity: .2"
            width="100%"
          >
          <q-btn
            v-if="c.link"
            size="xs"
            type="a"
            color="primary"
            style="opacity:.8"
            :label="c.linkText"
            :href="c.link"
            target="_blank"
          />
        </div>
      </q-carousel-slide>
    </q-carousel>
    <!-- </div> -->
  </div>
</template>
<script>

export default {
  name: 'Carousal',
  props: {
    cList: {
      type: Array,
    },
  },
  data() {
    return {
      slide: this.cList[0].icon,
    };
  },
};
</script>
