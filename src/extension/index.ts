/* eslint-disable global-require, @typescript-eslint/no-var-requires */

// This must go first so we can use module aliases!
/* eslint-disable import/first */
require('module-alias').addAlias('@themeathon-layouts', require('path').join(__dirname, '.'));
require('module-alias').addAlias('@shared', require('path').join(__dirname, '../shared'));

import { ExtensionReturn } from '@themeathon-layouts/types';
import type { Configschema } from '@themeathon-layouts/types/schemas/configschema';
import type NodeCGTypes from '@nodecg/types';
import { set } from './util/nodecg';

export = (nodecg: NodeCGTypes.ServerAPI<Configschema>): ExtensionReturn => {
  set(nodecg);

  // If `thisEvent` is 2, checks if we actually have 2 event shorts to
  // pick from before mounting the extension.
  const config = nodecg.bundleConfig;
  if (config.event.thisEvent === 2
  && (typeof config.event.shorts === 'string' || config.event.shorts.length === 1)) {
    throw new Error('event.thisEvent in config is set to 2 but you only '
      + 'have 1 event short at event.shorts');
  }

  const { useTestData } = nodecg.bundleConfig;
  if (useTestData) {
    nodecg.log.warn('USING TEST DATA, MAKE SURE TO DISABLE THIS IN PRODUCTION!');
  }

  /**
   * Because of how `import`s work, it helps to use `require`s to force
   * things to be loaded *after* the NodeCG context is set.
   */
  require('./layouts');
  require('./tracker');
  require('./misc');
  require('./mixer');
  require('./streamdeck-buttons');
  require('./timer');
  require('./text-to-speech');
  require('./music');
  require('./intermission-player');
  require('./flagcarrier');
  require('./omnibar');
  require('./server');
  require('./streamlabs-charity');
  require('./intermission-slides');

  return {
    obs: require('./util/obs').default,
    mixer: require('./mixer'),
    config: nodecg.bundleConfig,
  };
};
