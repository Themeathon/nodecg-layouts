<template>
  <v-app>
    <div :style="{ 'font-style': 'italic', 'margin-bottom': '5px' }">
      This should only need to be used if the automatically set one is incorrect.
    </div>
    <div :style="{ overflow: 'hidden', 'white-space': 'nowrap' }">
      <span :style="{ 'font-weight': 'bold' }">
        Currently Set:
      </span>
      <span
        v-if="upcomingRunID"
        :title="getRunStr(upcomingRunID)"
      >
        {{ getRunStr(upcomingRunID) }}
      </span>
      <span v-else>
        none
      </span>
    </div>
    <div
      v-for="(type, i) in ['previous', 'current', 'next']"
      :key="i"
      :style="{ 'margin-top': '5px' }"
    >
      <v-btn
        v-if="runDataActiveRunSurrounding[type]"
        class="ForceUpcomingRunBtn"
        width="100%"
        block
        :title="getRunStr(runDataActiveRunSurrounding[type])"
        @click="forceUpcomingRun(runDataActiveRunSurrounding[type])"
      >
        <div
          class="d-flex justify-center"
          :style="{ width: '100%' }"
        >
          <div :style="{ overflow: 'hidden' }">
            Force to {{ type }} ({{ getRunStr(runDataActiveRunSurrounding[type]) }})
          </div>
        </div>
      </v-btn>
      <v-btn
        v-else
        width="100%"
        block
        disabled
      >
        {{ type }} not available
      </v-btn>
    </div>
    <v-btn
      :style="{ 'margin-top': '5px' }"
      @click="forceUpcomingRun()"
    >
      Force to nothing
    </v-btn>
  </v-app>
</template>

<script lang="ts">
import { replicantNS } from '@themeathon-layouts/browser_shared/replicant_store';
import { UpcomingRunID } from '@themeathon-layouts/types/schemas';
import { RunDataActiveRunSurrounding, RunDataArray } from 'speedcontrol-util/types/schemas';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class UpcomingRunControl extends Vue {
  @replicantNS.State((s) => s.reps.runDataArray) readonly runDataArray!: RunDataArray;
  @replicantNS.State((s) => s.reps.runDataActiveRunSurrounding)
  readonly runDataActiveRunSurrounding!: RunDataActiveRunSurrounding;
  @replicantNS.State((s) => s.reps.upcomingRunID) readonly upcomingRunID!: UpcomingRunID;

  forceUpcomingRun(id?: string): void {
    nodecg.sendMessage('forceUpcomingRun', id);
  }

  getRunStr(id: string): string {
    const run = this.runDataArray.find((r) => r.id === id);
    if (run) {
      const arr = [
        run.game || '?',
        run.category,
      ].filter(Boolean);
      return arr.join(' - ');
    }
    return '?';
  }
}
</script>

<style>
  .ForceUpcomingRunBtn > .v-btn__content {
    width: 100%;
  }
</style>
