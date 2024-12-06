<template>
  <div
    v-if="donationReader"
    class="Flex DonationReader"
    :style="{ height: '100%' }"
  >
    <div
      class="Flex Mic"
      :style="{
        'box-sizing': 'border-box',
        height: '100%',
        padding: '5px'
      }"
    >
      <img
        src="./Mic.png"
        :style="{ height: '100%' }"
      >
    </div>
    <div
      :style="{
        display: 'flex',
        padding: '0 15px',
      }"
    >
      <template>
        {{ name }}
        <div
          v-if="pronouns"
          class="Pronouns"
          :style="{
            padding: '3px 5px',
            'margin-left': '10px',
          }"
        >
          {{ pronouns }}
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Commentators, DonationReader } from '@themeathon-layouts/types/schemas';
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';

@Component
export default class extends Vue {
  @State readonly commentators!: Commentators;
  @State donationReader!: DonationReader;
  theme = nodecg.bundleConfig.event.theme;

  get name(): string | undefined {
    if (!this.donationReader) {
      return undefined;
    }
    return this.donationReader.replace(/\((.*?)\)/g, '').trim();
  }

  get pronouns(): string | undefined {
    if (!this.donationReader) {
      return undefined;
    }
    return (this.donationReader.match(/\((.*?)\)/g) || [])[0]?.replace(/[()]/g, '');
  }
}
</script>

<style scoped>
  .PronounsComms {
    position: relative;
    display: inline-block;
    font-weight: 400;
    font-size: 0.75em;
    top: -0.1em;
    line-height: 1.5em;
    color: #cccccc;
    text-transform: uppercase;
    padding: 0 3px;
    margin-left: 3px;
  }
</style>
