<template>
  <div class="q-pa-sm">
    <!-- <div class="q-gutter-sm"> -->
    <q-carousel
      v-if="cList"
      v-model="slide"
      transition-prev="scale"
      transition-next="scale"
      swipeable
      :autoplay="6500"
      position="bottom-left"
      animated
      control-color="primary"
      navigation
      infinite
      height="240px"
      style="background:rgb(254 218 65 / 25.5%) !important;"
      class="text-white shadow-1 rounded-borders"
    >
      <q-carousel-slide
        v-for="c in cList"
        :key="c.icon"
        :name="c.icon"
        class="column no-wrap flex-center"
      >
        <div class="q-mt-md text-center vertical-bottom">
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
            color="primary"
            style="opacity:.8"
            :label="c.linkText"
            :to="c.link"
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
