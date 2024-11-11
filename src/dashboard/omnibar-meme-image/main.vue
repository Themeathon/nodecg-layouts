<template>
  <v-app>
    <v-btn
      :style="{ 'margin-bottom': '10px' }"
      :disabled="disable"
      @click="showPresets = !showPresets"
    >
      Toggle Presets
    </v-btn>
    <div v-if="showPresets">
      <img
        v-for="i of images"
        :key="i.text"
        :src="i.src"
        :style="{
          width: '80px',
          height: 'auto',
          padding: '2px',
          cursor: 'pointer'
        }"
        :class="entry === i.src ? 'selected' : ''"
        :title="i.text"
        @click="modifyImage(i.src)"
      >
    </div>
    <div class="d-flex">
      <v-text-field
        v-model="entry"
        label="Meme Image"
        hide-details
        filled
        :spellcheck="false"
        :disabled="disable"
        @keyup.enter="modify(); $event.target.blur();"
      />
      <v-btn
        height="56px"
        :style="{ 'min-width': '0', 'margin-left': '5px' }"
        :disabled="disable"
        @click="modify()"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </div>
    <v-btn
      :style="{ 'margin-top': '10px' }"
      :disabled="disable"
      @click="modify(true)"
    >
      Clear
    </v-btn>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { OmnibarMemeImage } from '@themeathon-layouts/types/schemas';
import { replicantNS } from '@themeathon-layouts/browser_shared/replicant_store';

@Component
export default class extends Vue {
  @replicantNS.State((s) => s.reps.omnibarMemeImage) readonly omnibarMemeImage!: OmnibarMemeImage;
  entry = '';
  disable = false;

  showPresets = false;
  images = [
    {
      text: 'Prayge',
      src: 'https://cdn.7tv.app/emote/60aec2196cfcffe15f4e4f93/4x.webp',
    },
    {
      text: 'GigaChad',
      src: 'https://cdn.7tv.app/emote/60ae958e229664e8667aea38/4x.webp',
    },
    {
      text: 'Donowall',
      src: 'https://cdn.7tv.app/emote/60a9cfe96daf811370b0b640/4x.webp',
    },
    {
      text: 'DIESOFCRINGE',
      src: 'https://cdn.7tv.app/emote/611523959bf574f1fded6d72/4x.webp',
    },
  ];

  @Watch('omnibarMemeImage', { immediate: true })
  onOmnibarMemeImageChanged(val: OmnibarMemeImage): void {
    this.entry = val || '';
  }

  async modify(clear = false): Promise<void> {
    this.disable = true;
    try {
      await nodecg.sendMessage('omnibarMemeImageModify', clear ? null : this.entry);
    } catch (err) {
      // catch
    }
    this.entry = this.omnibarMemeImage || '';
    this.disable = false;
  }

  modifyImage(src = ''): void {
    this.onOmnibarMemeImageChanged(src);
  }
}
</script>

<style scoped>
.selected {
  outline: solid lightblue 3px;
}
</style>
