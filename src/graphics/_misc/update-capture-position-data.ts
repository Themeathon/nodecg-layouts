import type { CapturePositions } from '@themeathon-layouts/types/schemas';
import { getZoomAmount } from './helpers';

// eslint-disable-next-line import/prefer-default-export
export function updateCapturePositionData(layout: string): void {
  const capturePositions = nodecg.Replicant<CapturePositions>('capturePositions');
  NodeCG.waitForReplicants(capturePositions).then(() => {
    if (!capturePositions.value) return;
    const captureElems = document.getElementsByClassName('Capture');
    const pos: { [k: string]: { x: number; y: number; width: number; height: number } } = {};
    for (const el of captureElems) {
      const sizes = el.getBoundingClientRect();
      // Get the widths of all the borders to figure out the position/size without them.
      const topBorder = getComputedStyle(el).getPropertyValue('border-top-width');
      const rightBorder = getComputedStyle(el).getPropertyValue('border-right-width');
      const bottomBorder = getComputedStyle(el).getPropertyValue('border-bottom-width');
      const leftBorder = getComputedStyle(el).getPropertyValue('border-left-width');
      const calcSizes = {
        x: (sizes.x + parseInt(leftBorder, 10)) * getZoomAmount(),
        y: (sizes.y + parseInt(topBorder, 10)) * getZoomAmount(),
        width: (sizes.width - parseInt(rightBorder, 10)
          - parseInt(leftBorder, 10)) * getZoomAmount(),
        height: (sizes.height - parseInt(bottomBorder, 10)
          - parseInt(topBorder, 10)) * getZoomAmount(),
      };
      pos[el.id] = calcSizes;
    }
    capturePositions.value[layout] = pos;
  });
}
