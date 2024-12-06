<template>
  <div
    id="Omnibar"
    class="Flex"
    :style="{
      width: '1920px',
      height: '80px',
      position: 'fixed',
      zoom,
    }"
  >
    <img id="Logo"><!-- Logo -->
    <divider />
    <total /><!-- Donation Total -->
    <template v-if="theme !== 'themeat24'">
      <divider />
      <ticker /><!-- Ticker -->
    </template>
    <divider />
    <clock /><!-- Clock -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getZoomAmountCSS } from '../_misc/helpers';
import Clock from './components/Clock.vue';
import Divider from './components/Divider.vue';
import Ticker from './components/Ticker.vue';
import Total from './components/Total.vue';

@Component({
  components: {
    Divider,
    Total,
    Ticker,
    Clock,
  },
})
export default class extends Vue {
  theme = nodecg.bundleConfig.event.theme;
  zoom = getZoomAmountCSS();
}
</script>
