import type { Bids, BigbuttonPlayerMap, Commentators, Countdown, CurrentRunDelay, DonationAlerts, DonationReader, DonationTotal, DonationTotalMilestones, DonationsToRead, GameLayouts, IntermissionSlides, ObsData, Omnibar, OmnibarMemeImage, OtherStreamData, Prizes, ReaderIntroduction, ServerTimestamp, StreamDeckData, TtsVoices, UpcomingRunID, VideoPlayer } from '@themeathon-layouts/types/schemas';
import type NodeCGTypes from '@nodecg/types';
import clone from 'clone';
import { SpeedcontrolUtilBrowser } from 'speedcontrol-util';
import { RunDataActiveRun, RunDataArray, Timer } from 'speedcontrol-util/types';
import { RunDataActiveRunSurrounding } from 'speedcontrol-util/types/schemas';
import Vue from 'vue';
import type { Store } from 'vuex';
import { namespace } from 'vuex-class';
import { Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators';

const sc = new SpeedcontrolUtilBrowser(nodecg);

// Declaring replicants.
export const reps: {
  assetsDonationAlertAssets: NodeCGTypes.ClientReplicant<NodeCGTypes.AssetFile[]>;
  assetsIntermissionSlides: NodeCGTypes.ClientReplicant<NodeCGTypes.AssetFile[]>;
  assetsReaderIntroductionImages: NodeCGTypes.ClientReplicant<NodeCGTypes.AssetFile[]>;
  bids: NodeCGTypes.ClientReplicant<Bids>;
  bigbuttonPlayerMap: NodeCGTypes.ClientReplicant<BigbuttonPlayerMap>;
  commentators: NodeCGTypes.ClientReplicant<Commentators>;
  countdown: NodeCGTypes.ClientReplicant<Countdown>;
  currentRunDelay: NodeCGTypes.ClientReplicant<CurrentRunDelay>;
  donationAlerts: NodeCGTypes.ClientReplicant<DonationAlerts>;
  donationReader: NodeCGTypes.ClientReplicant<DonationReader>;
  donationsToRead: NodeCGTypes.ClientReplicant<DonationsToRead>;
  donationTotal: NodeCGTypes.ClientReplicant<DonationTotal>;
  donationTotalMilestones: NodeCGTypes.ClientReplicant<DonationTotalMilestones>;
  gameLayouts: NodeCGTypes.ClientReplicant<GameLayouts>;
  intermissionSlides: NodeCGTypes.ClientReplicant<IntermissionSlides>;
  obsData: NodeCGTypes.ClientReplicant<ObsData>;
  omnibar: NodeCGTypes.ClientReplicant<Omnibar>;
  omnibarMemeImage: NodeCGTypes.ClientReplicant<OmnibarMemeImage>;
  otherStreamData: NodeCGTypes.ClientReplicant<OtherStreamData>;
  prizes: NodeCGTypes.ClientReplicant<Prizes>;
  readerIntroduction: NodeCGTypes.ClientReplicant<ReaderIntroduction>;
  runDataActiveRun: NodeCGTypes.ClientReplicant<RunDataActiveRun>;
  runDataActiveRunSurrounding: NodeCGTypes.ClientReplicant<RunDataActiveRunSurrounding>;
  runDataArray: NodeCGTypes.ClientReplicant<RunDataArray>;
  serverTimestamp: NodeCGTypes.ClientReplicant<ServerTimestamp>;
  streamDeckData: NodeCGTypes.ClientReplicant<StreamDeckData>;
  timer: NodeCGTypes.ClientReplicant<Timer>;
  ttsVoices: NodeCGTypes.ClientReplicant<TtsVoices>;
  upcomingRunID: NodeCGTypes.ClientReplicant<UpcomingRunID>;
  videoPlayer: NodeCGTypes.ClientReplicant<VideoPlayer>;
  [k: string]: NodeCGTypes.ClientReplicant<unknown>;
} = {
  assetsDonationAlertAssets: nodecg.Replicant('assets:donation-alert-assets'),
  assetsIntermissionSlides: nodecg.Replicant('assets:intermission-slides'),
  assetsReaderIntroductionImages: nodecg.Replicant('assets:reader-introduction-images'),
  bids: nodecg.Replicant('bids'),
  bigbuttonPlayerMap: nodecg.Replicant('bigbuttonPlayerMap'),
  commentators: nodecg.Replicant('commentators'),
  countdown: nodecg.Replicant('countdown'),
  currentRunDelay: nodecg.Replicant('currentRunDelay'),
  donationAlerts: nodecg.Replicant('donationAlerts'),
  donationReader: nodecg.Replicant('donationReader'),
  donationsToRead: nodecg.Replicant('donationsToRead'),
  donationTotal: nodecg.Replicant('donationTotal'),
  donationTotalMilestones: nodecg.Replicant('donationTotalMilestones'),
  gameLayouts: nodecg.Replicant('gameLayouts'),
  intermissionSlides: nodecg.Replicant('intermissionSlides'),
  obsData: nodecg.Replicant('obsData'),
  omnibar: nodecg.Replicant('omnibar'),
  omnibarMemeImage: nodecg.Replicant('omnibarMemeImage'),
  otherStreamData: nodecg.Replicant('otherStreamData'),
  prizes: nodecg.Replicant('prizes'),
  readerIntroduction: nodecg.Replicant('readerIntroduction'),
  runDataActiveRun: sc.runDataActiveRun,
  runDataActiveRunSurrounding: sc.runDataActiveRunSurrounding,
  runDataArray: sc.runDataArray,
  serverTimestamp: nodecg.Replicant('serverTimestamp'),
  streamDeckData: nodecg.Replicant('streamDeckData'),
  timer: sc.timer,
  ttsVoices: nodecg.Replicant('ttsVoices'),
  upcomingRunID: nodecg.Replicant('upcomingRunID'),
  videoPlayer: nodecg.Replicant('videoPlayer'),
};

// All the replicant types.
export interface ReplicantTypes {
  assetsDonationAlertAssets: NodeCGTypes.AssetFile[];
  assetsIntermissionSlides: NodeCGTypes.AssetFile[];
  assetsReaderIntroductionImages: NodeCGTypes.AssetFile[];
  bids: Bids;
  bigbuttonPlayerMap: BigbuttonPlayerMap;
  commentators: Commentators;
  countdown: Countdown;
  currentRunDelay: CurrentRunDelay;
  donationAlerts: DonationAlerts;
  donationReader: DonationReader;
  donationsToRead: DonationsToRead;
  donationTotal: DonationTotal;
  donationTotalMilestones: DonationTotalMilestones;
  gameLayouts: GameLayouts;
  intermissionSlides: IntermissionSlides;
  obsData: ObsData;
  omnibar: Omnibar;
  omnibarMemeImage: OmnibarMemeImage;
  otherStreamData: OtherStreamData;
  prizes: Prizes;
  readerIntroduction: ReaderIntroduction;
  runDataActiveRun: RunDataActiveRun;
  runDataActiveRunSurrounding: RunDataActiveRunSurrounding;
  runDataArray: RunDataArray;
  serverTimestamp: ServerTimestamp;
  streamDeckData: StreamDeckData;
  timer: Timer;
  ttsVoices: TtsVoices;
  upcomingRunID: UpcomingRunID;
  videoPlayer: VideoPlayer;
}

@Module({ name: 'ReplicantModule', namespaced: true })
export class ReplicantModule extends VuexModule {
  // Replicant values are stored here.
  reps: { [k: string]: unknown } = {};

  get repsTyped(): ReplicantTypes {
    return this.reps as unknown as ReplicantTypes;
  }

  // This sets the state object above when a replicant sends an update.
  @Mutation
  setState({ name, val }: { name: string, val: unknown }): void {
    Vue.set(this.reps, name, clone(val));
  }

  // This is a generic mutation to update a named replicant.
  @Mutation
  setReplicant<K>({ name, val }: { name: string, val: K }): void {
    Vue.set(this.reps, name, clone(val)); // Also update local copy, although no schema validation!
    reps[name].value = clone(val);
  }
}

// eslint-disable-next-line import/no-mutable-exports
export let replicantModule!: ReplicantModule;
export const replicantNS = namespace('ReplicantModule');

export async function setUpReplicants(store: Store<unknown>): Promise<void> {
  // Listens for each declared replicants "change" event, and updates the state.
  Object.keys(reps).forEach((name) => {
    reps[name].on('change', (val) => {
      store.commit('ReplicantModule/setState', { name, val });
    });
  });
  // We should make sure the replicant are ready to be read, needs to be done in browser context.
  await NodeCG.waitForReplicants(...Object.keys(reps).map((key) => reps[key]));
  replicantModule = getModule(ReplicantModule, store);
}
