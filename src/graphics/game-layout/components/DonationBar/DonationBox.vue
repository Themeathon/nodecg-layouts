<template>
  <div
    :class="`Flex ${tierClass}`"
    :aria-valuetext="`KnoppikoAcht`"
    :style="{
      height: '100%',
      padding: `0 ${padding}px`,
      'margin-right': '3px',
      'white-space': 'nowrap',
    }"
  >
    ${{ Number.isInteger(donation.amount)
      ? donation.amount : donation.amount.toFixed(2)
    }} [{{ donation.donor_visiblename }}]

    <!-- <script lang="js">
    async function loadData() {
      const response = await fetch('test.txt');
      const text = await response.text();
      this.data = text; // Speichern des Dateninhalts in der Variable "data"
      document.querySelectorAll('[aria-valuetext="KnoppikoAcht"]').innerHTML += this.data;
    }
    </script> -->

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { NotableDonations } from '@themeathon-layouts/types/schemas';

@Component
export default class extends Vue {
  @Prop(Object) donation!: NotableDonations[0];
  @Prop({ default: 15 }) padding!: number;

  get tierClass(): string {
    const rand = 1 + Math.floor(Math.random() * 3);
    if (this.donation.amount < 50) { // Under $50
      return `DonationBoxTier1-${rand}`;
    }
    if (this.donation.amount >= 50 && this.donation.amount < 100) { // $50 - $100
      return `DonationBoxTier2-${rand}`;
    }
    if (this.donation.amount >= 100) { // $100+
      return 'DonationBoxTier3';
    }
    return 'DonationBox';
  }
}
</script>
