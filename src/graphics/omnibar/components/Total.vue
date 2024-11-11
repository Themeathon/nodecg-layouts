<template>
  <img
    v-if="theme === 'themeat24'"
    id="CharityLogo"
    :style="{
      opacity: showAlert ? 0.3 : 1,
      transition: 'opacity 0.5s',
      'background': memeImageBackground,
      'background-size': 'contain',
      'background-repeat': 'round round'
    }"
  >
  <div
    v-else
    class="Flex"
    :style="{
      'margin-right': flexMargin,
       overflow: 'hidden',
       'align-items': 'center !important'
    }"
  >
    <!-- Alert sound effect. -->
    <!--<audio ref="SFX">
      <source src="./sfx/mario_coin.mp3" type="audio/mpeg">
    </audio>-->
    <template v-if="theme === 'swcf'">
      <!-- Alerts. -->
      <div
        class="Flex"
        :style="{
            opacity: showAlert ? 1 : 0,
            transition: 'opacity 0.5s',
        }"
      >
        <img
          src="./img/CoinFaster.gif"
          :style="{
            height: '40px',
            'image-rendering': 'pixelated',
            'margin-right': '2px',
          }"
        >
        <span
          :style="{
            'font-size': '30px',
            color: '#7FFF00', // Basic green, no need to use theme
            'font-weight': 600,
            'background-color': 'rgba(0,0,0,0.6)',
            padding: '4px 8px',
            'border-radius': '10px',
          }"
        >
          +{{ alertText }}
        </span>
      </div>
      <!-- Actual total. -->
      <div
        id="Total"
        class="Flex"
        :style="{
          'font-size': '40px',
          'font-weight': 500,
          'min-width': '80px',
          'padding': '0 15px 0 25px',
        }"
      >
        <span
          v-for="(char, i) in totalStr"
          :key="i"
          :class="getClassForChar(char)"
        >
          {{ char }}
        </span>
      </div>
      <!-- Charity logo. -->
      <img
        id="CharityLogo"
        :style="{
          transition: 'opacity 0.5s',
        }"
      >
    </template>
    <template v-else>
      <div class="Grid" :style="{ 'min-width': '110px' }">
        <!-- Charity logo. -->
        <div class="Flex" :style="{ 'z-index': 0 }">
          <img
            id="CharityLogo"
            :style="{
              opacity: showAlert ? 0.3 : 1,
              transition: 'opacity 0.5s',
            }"
          >
        </div>
        <!-- Alerts. -->
        <div
          class="Flex"
          :style="{
              'z-index': 1,
              opacity: showAlert ? 1 : 0,
              transition: 'opacity 0.5s',
          }"

        >
          <img
            src="./img/CoinFaster.gif"
            :style="{
              height: '30px',
              'image-rendering': 'pixelated',
              'margin-right': '2px',
            }"
          >
          <span
            :style="{
              'font-size': '20px',
              color: '#7FFF00', // Basic green, no need to use theme
              'font-weight': 600,
              'background-color': 'rgba(0,0,0,0.6)',
              padding: '4px 8px',
              'border-radius': '10px',
            }"
          >
            +{{ alertText }}
          </span>
        </div>
      </div>
      <!-- Actual total. -->
      <div
        id="Total"
        class="Flex"
        :style="{
          'font-size': '40px',
          'font-weight': 500,
          'min-width': '80px',
        }"
      >
        <span
          v-for="(char, i) in totalStr"
          :key="i"
          :class="getClassForChar(char)"
        >
          {{ char }}
        </span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { replicantModule } from '@themeathon-layouts/browser_shared/replicant_store';
import { formatUSD } from '@themeathon-layouts/graphics/_misc/helpers';
import gsap from 'gsap';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { OmnibarMemeImage } from '@themeathon-layouts/types/schemas';

@Component
export default class extends Vue {
  // @Ref('SFX') sfx!: HTMLAudioElement;
  theme = nodecg.bundleConfig.event.theme;
  total = 0;
  playingAlerts = false;
  showAlert = false;
  alertText = '$0';
  alertList: { total: number, amount: number }[] = [];
  memeImage = '';

  get rawTotal(): number {
    return replicantModule.repsTyped.donationTotal;
  }

  get omnibarMemeImage(): OmnibarMemeImage {
    return replicantModule.repsTyped.omnibarMemeImage;
  }

  get totalStr(): string {
    // "Reset" value every 10k, specific to ESA Legends 2023.
    const { symbol } = nodecg.bundleConfig.event.currency;
    const { countryCode } = nodecg.bundleConfig.event.currency;

    const esal23 = nodecg.bundleConfig.event.shorts === 'esal23';

    return `${symbol}${
      Math.floor(esal23 ? this.total % 10000 : this.total).toLocaleString(countryCode, {
        maximumFractionDigits: 0,
        minimumIntegerDigits: esal23 && this.total >= 10000 ? 4 : undefined,
      })}`;
  }

  get flexMargin(): string {
    switch (this.theme) {
      case 'swcf':
        return '10px';
      case 'themeat24':
        return '0';
      default:
        return '20px';
    }
  }

  get memeImageBackground(): string {
    return `url(${this.omnibarMemeImage})`;
  }

  getClassForChar(char: string): string | undefined {
    if ([' ', ',', '.'].includes(char)) return 'Comma';

    if (char >= '0' && char <= '9') return 'Number';

    return undefined;
  }

  async playNextAlert(start = false): Promise<void> {
    this.playingAlerts = true;
    if (!start) await new Promise((res) => { setTimeout(res, 500); });
    if (this.alertList[0].amount > 0) { // Only show alerts for positive values
      nodecg.sendMessage('omnibarPlaySound', { amount: this.alertList[0].amount });
      // await this.sfx.play();
      await new Promise((res) => { setTimeout(res, 500); });
      this.showAlert = true;
      this.alertText = formatUSD(this.alertList[0].amount);
    }
    gsap.to(this, {
      total: this.alertList[0].total,
      duration: 5,
    });
    await new Promise((res) => { setTimeout(res, 6000); });
    this.alertList.shift();
    this.showAlert = false;
    if (this.alertList.length) this.playNextAlert();
    else this.playingAlerts = false;
  }

  @Watch('rawTotal')
  onRawTotalChanged(newVal: number, oldVal: number): void {
    this.alertList.push({
      total: newVal,
      amount: newVal - oldVal,
    });
    if (!this.playingAlerts) this.playNextAlert(true);
  }

  @Watch('omnibarMemeImage')
  onOmnibarMemeImageChange(newVal: OmnibarMemeImage): void {
    this.memeImage = newVal;
  }

  async created(): Promise<void> {
    this.total = this.rawTotal;
  }
}
</script>

<style scoped>
  /* Each character in the total is in a span; setting width so the numbers appear monospaced. */
  #Total > span {
    display: inline-block;
    width: 0.4em;
    text-align: center;
  }
  #Total > .Number {
    width: 0.45em;
  }
  #Total > .Comma,
  #Total > .Space {
    width: 0.22em;
  }
</style>
