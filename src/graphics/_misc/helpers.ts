import { Configschema } from '@themeathon-layouts/types/schemas';
import { DeepWritable } from 'ts-essentials';

const config = nodecg.bundleConfig;

/**
 * Returns the current event short according to the configuration file.
 */
export function getCurrentEventShort(): string {
  const cfg = (config as DeepWritable<Configschema>).event.shorts;
  if (!Array.isArray(cfg)) return cfg;
  return cfg[config.event.thisEvent - 1];
}

/**
 * Checks if number needs a 0 adding to the start and does so if needed.
 * @param num Number which you want to turn into a padded string.
 */
export function padTimeNumber(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * Converts milliseconds into a time string (HH:MM:SS).
 * @param ms Milliseconds you wish to convert.
 */
export function msToTimeStr(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `${padTimeNumber(hours)
    }:${padTimeNumber(minutes)
    }:${padTimeNumber(seconds)}`;
}

/**
 * Simple formatter for displaying currency amounts.
 * @param amount Amount as a integer/float.
 * @param _symbol The currency symbol (defaults to what's set in the config)
 * @param _countryCode The country code (defaults to what's set in the config)
 */
export function formatCurrency(
  amount: number,
  _symbol?: string,
  _countryCode?: string,
): string {
  const cfg = config.event.currency;
  const symbol = _symbol || cfg.symbol;
  const countryCode = _countryCode || cfg.countryCode;

  if (amount >= 100) {
    return `${symbol}${Math.floor(amount).toLocaleString(
      countryCode,
      {
        maximumFractionDigits: 0,
      },
    )}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Simple formatter for displaying USD amounts.
 * @param amount Amount as a integer/float.
 */
export function formatUSD(amount: number): string {
  return formatCurrency(amount);

  // We would use this as the fallback, but we have overrides in the config now
  // return formatCurrency(amount, '$', 'en-US');
}

/**
 * Returns the "zoom amount" that should be applied to meet the
 * canvas resolution in the config.
 * @returns Zoom amount as a decimal.
 */
export function getZoomAmount(): number {
  return config.obs.canvasResolution.height / 1080;
}

/**
 * Returns the CSS for the `zoom` propety that should be applied to meet the
 * canvas resolution in the config.
 * @returns CSS string used for the `zoom` property.
 */
export function getZoomAmountCSS(): string {
  return `calc(${config.obs.canvasResolution.height}/1080)`;
}

/**
 * Basic wait promise command.
 * @param length Length in milliseconds.
 * @param reason If supplied, will reject with this reason after the wait.
 */
export function wait(length: number, reason?: string): Promise<void> {
  return new Promise((res, rej) => {
    window.setTimeout(() => (!reason ? res() : rej(reason)), length);
  });
}

/**
 * Wrapper that allows an async/await function/Promise to have a max length before it times out.
 * @param promise Function you want to await on a timeout.
 * @param delay Millseconds you wish to wait before error.
 */
export function awaitTimeout(promise: Promise<void>, delay: number): Promise<void> {
  return Promise.race([promise, wait(delay, 'timeout')]);
}
