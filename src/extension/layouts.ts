import { CapturePositions, Configschema } from '@themeathon-layouts/types/schemas';
import Countdown from '@shared/extension/countdown';
import clone from 'clone';
import type { DeepWritable } from 'ts-essentials';
import { logError } from './util/helpers';
import { get as nodecg } from './util/nodecg';
import obs from './util/obs';
import { capturePositions, gameLayouts, nameCycle } from './util/replicants';
import { sc } from './util/speedcontrol';

const config = nodecg().bundleConfig;
new Countdown(nodecg()); // eslint-disable-line no-new

const obsNamesCfg = (config as DeepWritable<Configschema>).obs.names;
const gameCaptures = Array.isArray(obsNamesCfg.groups.gameCaptures)
  ? obsNamesCfg.groups.gameCaptures
  : [obsNamesCfg.groups.gameCaptures];
const cameraCaptures = Array.isArray(obsNamesCfg.groups.cameraCaptures)
  ? obsNamesCfg.groups.cameraCaptures
  : [obsNamesCfg.groups.cameraCaptures];
const allCaptures = gameCaptures.concat(cameraCaptures);
const gameSources = Array.isArray(obsNamesCfg.sources.gameSources)
  ? obsNamesCfg.sources.gameSources
  : [obsNamesCfg.sources.gameSources];
const cameraSources = Array.isArray(obsNamesCfg.sources.cameraSources)
  ? obsNamesCfg.sources.cameraSources
  : [obsNamesCfg.sources.cameraSources];
// For ease of use, we attach the type of the source to each name as well.
const allSources = (gameSources.map((v) => ({ name: v, type: 'game' }))
  .concat(cameraSources.map((v) => ({ name: v, type: 'camera' })))
) as { name: string, type: 'game' | 'camera' }[];

// CSS ID -> OBS source name mapping
// TODO: Make this be generated programatically.
const obsSourceKeys: { [key: string]: string | undefined } = {
  GameCapture1: gameCaptures[0],
  GameCapture2: gameCaptures[1],
  GameCapture3: gameCaptures[2],
  GameCapture4: gameCaptures[3],
  CameraCapture1: cameraCaptures[0],
  CameraCapture2: cameraCaptures[1],
  CameraCapture3: cameraCaptures[2],
  CameraCapture4: cameraCaptures[3],
  // CameraCaptureCrowd: config.obs.names.sources.cameraSourceCrowd || undefined,
};

// Stores current cropping values for each mode.
// We fill up slots here for both "types" of capture as they are actually interchangable.
const gameCropValues = Array(gameCaptures.length + cameraCaptures.length)
  .fill({ top: 0, right: 0, bottom: 0, left: 0 });
const cameraCropValues = Array(gameCaptures.length + cameraCaptures.length)
  .fill({ top: 0, right: 0, bottom: 0, left: 0 });

// Things that are currently "selected", mostly used by XKeys for backlights.
// We fill up slots here for both "types" of capture as they are actually interchangable.
const selected = {
  captureIndex: -1,
  sourceIndex: Array(gameCaptures.length + cameraCaptures.length).fill(-1),
  gameCrop: -1,
};

// Controls the name cycling ticks for user information.
function cycleNames(reset = false): void {
  let cycle = 0;
  if (!reset) {
    cycle = nameCycle.value + 1;
  }
  if (cycle === 0) { // Name
    setTimeout(cycleNames, 45 * 1000);
  } else if (cycle === 1) { // Twitch
    setTimeout(cycleNames, 15 * 1000);
  } else {
    cycleNames(true);
    return;
  }
  nameCycle.value = cycle;
}
cycleNames(true);

// Change the game layout based on information supplied via the run data.
let layoutInit = false;
sc.runDataActiveRun.on('change', (newVal, oldVal) => {
  // This shouldn't trigger on initial start up, so should only happen on an *actual* run change.
  if (newVal && layoutInit) {
    // If there's no old run or we changed to a different run, try to automatically set the layout.
    if (!oldVal || newVal.id !== oldVal.id) {
      const layout = gameLayouts.value.available
        .find((l) => l.code.toLowerCase() === newVal.customData.layout?.toLowerCase());
      gameLayouts.value.selected = layout?.code;
      if (newVal.customData.layout && !layout) {
        nodecg().log.warn(
          '[Layouts] Run specified game layout with code %s but none available',
          newVal.customData.layout,
        );
      } else if (newVal.customData.layout && layout) {
        nodecg().log.info(`[Layouts] Game layout changed to ${layout.name} (${layout.code})`);
      }
    }
  } else if (!newVal && layoutInit) {
    // If the active run is removed, return to selecting "nothing"
    // (graphic will reselect the default).
    delete gameLayouts.value.selected;
  }
  layoutInit = true;
});

/**
 * Used to retrieve the stored crop and area values for a capture depending on the source mode
 * and the area on the game layout.
 * @param mode What mode we are operating in for the relevant capture.
 * @param areaName CSS ID for the capture (e.g. "GameCapture1")
 * @param groupSourceName OBS source name for the capture (e.g. "Game Capture 1")
 * @returns Both the crop values and the area values if possible.
 */
async function getStoredCropAndAreaVals(
  mode: 'game' | 'camera',
  areaName: string,
  groupSourceName: string,
  recall = false,
) {
  const area = capturePositions.value['game-layout'][areaName] as
    CapturePositions[0][0] | undefined;
  let crop = { top: 0, right: 0, bottom: 0, left: 0 }; // Default crop values
  // If this a game source, use cropping we have stored for those.
  if (mode === 'game') crop = gameCropValues[allCaptures.indexOf(groupSourceName)];
  // If this is a camera source, cropping is a little more complicated.
  if (mode === 'camera' && area) {
    const storedCrop = cameraCropValues[allCaptures.indexOf(groupSourceName)];
    // If "recall" is specified and we have a stored crop,
    // just return stored values and don't fully calculate them again.
    if (recall && storedCrop) crop = clone(storedCrop);
    else {
      try {
        // Cameras need cropping if not exactly 16:9.
        // Wider need top/bottom cropping.
        // Thinner need left/right cropping.
        const sceneItemProperties = await obs.conn.send('GetSceneItemProperties', {
          'scene-name': config.obs.names.scenes.gameLayout,
          item: { name: groupSourceName },
        });
        const cameraAR = sceneItemProperties.sourceWidth / sceneItemProperties.sourceHeight;
        const areaAR = area.width / area.height;
        if (areaAR > cameraAR) {
          const newHeight = sceneItemProperties.sourceWidth / areaAR;
          const cropAmount = Math.floor((sceneItemProperties.sourceHeight - newHeight) / 2);
          crop.top = cropAmount;
          crop.bottom = cropAmount;
        } else if (areaAR < cameraAR) {
          const newWidth = sceneItemProperties.sourceHeight * areaAR;
          const cropAmount = Math.floor((sceneItemProperties.sourceWidth - newWidth) / 2);
          crop.left = cropAmount;
          crop.right = cropAmount;
        }
        cameraCropValues[allCaptures.indexOf(groupSourceName)] = clone(crop);
      } catch (err) {
        logError('[Layouts] Could not find camera source to crop [%s]', err, areaName);
      }
    }
  }
  return { crop, area };
}

// Listens to the replicant that stores the "capture positions" for various graphics
// sent by the browser (as of writing, only game-layout), to know where to move OBS items.
let positionsInit = false;
// let crowdCamPrevious = gameLayouts.value.crowdCamera;
capturePositions.on('change', async (val) => {
  // Ignore first emitted event on start up.
  if (!positionsInit) {
    positionsInit = true;
    return;
  }

  // Don't run if OBS integration is disabled or we are not connected.
  if (!config.obs.enabled || !obs.connected) return;

  // Don't run this code at all if only on "partial" online support
  // or there's no game-layout values.
  if (config.event.online === 'partial' || !val['game-layout']) return;

  // Loops through all possible sources to move and does the work.
  // areaName: CSS ID (e.g. "GameCapture1")
  // groupSourceName: name of group source in OBS (e.g. "Game Capture 1")
  for (const [areaName, groupSourceName] of Object.entries(obsSourceKeys)) {
    if (groupSourceName) { // Only continue if key -> value pair is set
      // Check for mode of currently selected source for this capture.
      const mode = allSources[selected.sourceIndex[allCaptures.indexOf(groupSourceName)]]?.type;

      // Get relevant crop values for this capture for the specific mode it's in.
      const { crop, area } = await getStoredCropAndAreaVals(mode, areaName, groupSourceName);

      try {
        // Special game capture source cropping for sm64-psp-2p game layout.
        // TODO: IF THIS GETS IN THE WAY OF CHANGES, JUST REMOVE IT!
        /* if (['GameCapture1', 'GameCapture2'].includes(areaName)
        && gameLayouts.value.selected === 'sm64-psp-2p') {
          const sceneItemProperties = await obs.conn.send('GetSceneItemProperties', {
            'scene-name': config.obs.names.scenes.gameLayout,
            item: { name: groupSourceName },
          });
          crop = {
            top: 0,
            right: areaName === 'GameCapture1' ? sceneItemProperties.sourceWidth / 2 : 0,
            bottom: 0,
            left: areaName === 'GameCapture2' ? sceneItemProperties.sourceWidth / 2 : 0,
          };
        } */

        await obs.configureSceneItem(
          config.obs.names.scenes.gameLayout, // Scene
          groupSourceName, // Item
          // eslint-disable-next-line arrow-body-style
          (() => { // Area
            // Special game capture settings for DS-1p, 3DS-1p and sm64-psp-2p when online.
            // TODO: IF THIS GETS IN THE WAY OF CHANGES, JUST REMOVE IT!
            /* if (config.event.online && areaName.startsWith('GameCapture')
            && ['DS-1p', '3DS-1p', 'sm64-psp-2p'].includes(gameLayouts.value.selected || '')) {
              // sm64-psp-2p.
              if (gameLayouts.value.selected === 'sm64-psp-2p'
              && ['GameCapture1', 'GameCapture2'].includes(areaName)) {
                return {
                  x: areaName === 'GameCapture2' ? config.obs.canvasResolution.width / 2 : 0,
                  y: 0,
                  width: config.obs.canvasResolution.width / 2,
                  height: config.obs.canvasResolution.height,
                };
              }
              // All others.
              if (areaName === 'GameCapture1') {
                return {
                  x: 0,
                  y: 0,
                  width: config.obs.canvasResolution.width,
                  height: config.obs.canvasResolution.height,
                };
              }
              return undefined;
            } */
            return area;
          })(),
          crop, // Crop
          // eslint-disable-next-line arrow-body-style
          (() => { // Visible
            // Special game capture settings for DS-1p, 3DS-1p and sm64-psp-2p when online.
            // TODO: IF THIS GETS IN THE WAY OF CHANGES, JUST REMOVE IT!
            /* if (config.event.online && areaName.startsWith('GameCapture')
            && ['DS-1p', '3DS-1p', 'sm64-psp-2p'].includes(gameLayouts.value.selected || '')) {
              if (areaName === 'GameCapture1') return true;
              if (areaName === 'GameCapture2' && gameLayouts.value.selected === 'sm64-psp-2p') {
                return true;
              }
              return false;
            } */
            return !!area;
          })(),
        );
      } catch (err) {
        logError('[Layouts] Could not successfully configure capture position [%s]', err, areaName);
      }
    }
  }
});

// Things to do on OBS initial connection/authentication.
// This should also trigger even if authentication is turned off, after initial connection.
// TODO: Any checks needed for "online" marathons? Some were removed; we don't care about
// them anymore anyway so not too much of an issue, not sure why the check was there
// in the first place.
obs.conn.on('AuthenticationSuccess', async () => {
  // Loop through all capture scenes.
  for (const [captureIndex, captureName] of allCaptures.entries()) {
    let mode: 'game' | 'camera' | undefined;
    // Loop through all sources inside of this capture scene, and get properties from OBS.
    for (const [sourceIndex, { name: sourceName }] of allSources.entries()) {
      try {
        const itemProperties = await obs.conn.send('GetSceneItemProperties', {
          'scene-name': captureName,
          item: { name: sourceName },
        });
        // If this source in the capture scene is toggled as being visible, assume this is the
        // one that should be marked on the xkeys.
        if (itemProperties.visible) {
          selected.sourceIndex[captureIndex] = sourceIndex;
          // We check here if the current source selected is game or camera so we can fill in the
          // current cropping information in the correct spot.
          if (gameSources.indexOf(sourceName) >= 0) mode = 'game';
          else if (cameraSources.indexOf(sourceName) >= 0) mode = 'camera';
          break; // We no longer need to check any more sources.
        }
      } catch (err) {
        logError(
          '[Layouts] Could not get initial source visibility values [%s: %s]',
          err,
          captureName,
          sourceName,
        );
      }
    }
    try {
      // Get properties of capture source in game layout scene.
      const itemProperties = await obs.conn.send('GetSceneItemProperties', {
        'scene-name': config.obs.names.scenes.gameLayout,
        item: { name: captureName },
      });
      // Fill in cropping information based on the type of source selected in the capture scene.
      if (mode === 'game') {
        gameCropValues[captureIndex] = itemProperties.crop;
      } else if (mode === 'camera') {
        cameraCropValues[captureIndex] = itemProperties.crop;
      }
    } catch (err) {
      logError('[Layouts] Could not get initial capture cropping values [%s]', err, captureName);
    }
  }
});
