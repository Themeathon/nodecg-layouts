<template>
  <div
    id="Ticker"
    class="Grid"
    :style="{
      flex: 1,
      overflow: 'hidden',
      height: '100%',
      // 'min-width': 0, // was probably used for overlapping things?
    }"
  >
    <transition name="ticker">
      <component
        v-if="omnibar.current"
        :is="omnibar.current.type"
        :key="`${omnibar.current.type}${JSON.stringify(omnibar.current.props)}`"
        v-bind="omnibar.current.props"
        @end="showNext"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import { replicantNS } from '@themeathon-layouts/browser_shared/replicant_store';
import { awaitTimeout } from '@themeathon-layouts/graphics/_misc/helpers';
import { Omnibar } from '@themeathon-layouts/types/schemas';
import { Vue, Component } from 'vue-property-decorator';
import GenericMsg from './Ticker/GenericMsg.vue';
import Tweet from './Ticker/Tweet.vue';
import MiniCredits from './Ticker/MiniCredits.vue';
import CrowdControl from './Ticker/CrowdControl.vue';
import UpcomingRun from './Ticker/UpcomingRun.vue';
import Prize from './Ticker/Prize.vue';
import Bid from './Ticker/Bid.vue';
import Milestone from './Ticker/Milestone.vue';

@Component({
  components: {
    GenericMsg,
    Tweet,
    MiniCredits,
    CrowdControl,
    UpcomingRun,
    Prize,
    Milestone,
    Bid,
  },
})
export default class extends Vue {
  @replicantNS.State((s) => s.reps.omnibar) readonly omnibar!: Omnibar;

  // Sends "omnibarShowNext" to extension; retries if not successful after 5s.
  async showNext(): Promise<void> {
    try {
      await awaitTimeout(nodecg.sendMessage('omnibarShowNext'), 5000);
    } catch (err) {
      this.showNext();
    }
  }
}
</script>

<style scoped>
  .ticker-enter-active, .ticker-leave-active {
    transition: opacity 1s;
  }
  .ticker-enter, .ticker-leave-to {
    opacity: 0;
  }
</style>
