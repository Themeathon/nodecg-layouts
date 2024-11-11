const config = nodecg.bundleConfig;

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
 */
export function formatCurrency(
  amount: number,
  _symbol?: string,
): string {
  const cfg = config.event.currency;
  const symbol = _symbol || cfg.symbol;

  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Simple formatter for displaying USD amounts.
 * @param amount Amount as a integer/float.
 */
export function formatUSD(amount: number): string {
  return formatCurrency(amount);
}
