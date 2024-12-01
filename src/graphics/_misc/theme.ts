/* eslint-disable @typescript-eslint/no-var-requires */

const { theme } = nodecg.bundleConfig.event;
const { default: defaultTheme } = require('./themes/default.theme.css');
const { default: themeat24 } = require('./themes/themeat24.theme.css');
const { default: themeat_hal24 } = require('./themes/themeat-hal24.theme.css');
const { default: themeat_ww24 } = require('./themes/themeat-ww24.theme.css');

switch (theme) {
  case 'themeat-ww24':
    themeat_ww24.use();
    break;
  case 'themeat-hal24':
    themeat_hal24.use();
    break;
  case 'themeat24':
    themeat24.use();
    break;
  default:
    defaultTheme.use();
}
