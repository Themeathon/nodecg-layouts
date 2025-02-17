import { replicantModule, ReplicantModule, ReplicantTypes } from '@themeathon-layouts/browser_shared/replicant_store';
import { GameLayouts } from '@themeathon-layouts/types/schemas';
import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

Vue.use(Vuex);

@Module({ name: 'OurModule' })
class OurModule extends VuexModule {
  // Helper getter to return all replicants.
  get reps(): ReplicantTypes {
    return this.context.rootState.ReplicantModule.reps;
  }

  @Mutation
  updateSelected(code?: string): void {
    replicantModule.setReplicant<GameLayouts>({
      name: 'gameLayouts', val: { ...replicantModule.repsTyped.gameLayouts, selected: code },
    });
  }

  @Mutation
  toggleCrowdCamera(val: boolean): void {
    replicantModule.setReplicant<GameLayouts>({
      name: 'gameLayouts', val: { ...replicantModule.repsTyped.gameLayouts, crowdCamera: val },
    });
  }
}

const store = new Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {},
  modules: { ReplicantModule, OurModule },
});
export default store;
export const storeModule = getModule(OurModule, store);
