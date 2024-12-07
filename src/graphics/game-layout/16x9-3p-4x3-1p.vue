<template>
  <div>
    <!-- Game Captures -->
    <game-capture
      id="GameCapture1"
      class="BorderRight BorderBottom"
      :slot-no="0"
      :style="{
        left: '0px',
        top: '0px',
        width: '960px',
        height: '540px',
      }"
    />
    <game-capture
      id="GameCapture2"
      class="BorderBottom"
      :slot-no="1"
      finish-time-pos="bottomright"
      :style="{
        left: '960px',
        top: '0px',
        width: '960px',
        height: '540px',
      }"
    />
    <game-capture
      id="GameCapture3"
      class="BorderRight"
      :slot-no="2"
      :style="{
        left: '489px',
        top: '540px',
        width: '613px',
        height: '460px',
      }"
    />
    <game-capture
      id="GameCapture4"
      :slot-no="3"
      :style="{
        left: '1102px',
        top: '540px',
        width: '818px',
        height: '460px',
      }"
    />

    <!-- Player 1/Commentator -->
    <div
      class="Fixed"
      :style="{
        left: '0px',
        top: '540px',
        width: '489px',
      }"
    >
      <player :slot-no="0" />
      <player :slot-no="1" />
      <player :slot-no="2" />
      <player :slot-no="3" />
      <commentators-reader />
      <commentators-reader show-reader />
    </div>

    <!-- Player 2/General Run Info -->
    <div
      class="Fixed FlexColumn"
      :style="{
        left: '0px',
        top: '800px',
        width: '489px',
        height: '200px',
      }"
    >

      <!-- Run Game Info/Timer -->
      <div
        class="FlexColumn"
        :style="{
          flex: '1',
          width: '100%',
          overflow: 'hidden',
        }"
      >
        <run-info
          :style="{ 'font-size': '32px' }"
          no-wrap
        />
        <timer font-size="80px" />
      </div>
    </div>

    <!-- Media Box -->
    <!-- <media-box
      :font-size="36"
      :style="{
        left: '0px',
        top: '852px',
        width: '489px',
        height: '148px',
      }"
    /> -->
  </div>
</template>

<script lang="ts">
import MediaBox from '@shared/graphics/mediabox';
import { RunDataActiveRun } from 'speedcontrol-util/types';
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import CommentatorsReader from './components/CommentatorsReader.vue';
import DonationBar from './components/DonationBar.vue';
import GameCapture from './components/GameCapture.vue';
import Player from './components/Player.vue';
import RunInfo from './components/RunInfo.vue';
import Timer from './components/Timer.vue';

@Component({
  components: {
    GameCapture,
    Player,
    CommentatorsReader,
    RunInfo,
    Timer,
    MediaBox,
    DonationBar,
  },
})
export default class extends Vue {
  @State((s) => s.gameLayouts.crowdCamera) readonly crowdCam!: boolean;
  online = nodecg.bundleConfig.event.online;
  @State('runDataActiveRun') runData!: RunDataActiveRun;

  get extraPlayers(): { name: string, pronouns?: string }[] {
    if (this.runData?.relay) return [];
    return (this.runData?.teams[0]?.players || []).slice(2).map((p) => ({
      name: p.name,
      pronouns: p.pronouns,
    }));
  }
}
</script>
