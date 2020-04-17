import { Configschema } from 'configschema';
import needle, { NeedleResponse } from 'needle';
import { EventInfo } from 'types';
import { get as nodecg } from './util/nodecg';
import { evt } from './util/rabbitmq';
import { donationTotal, notableDonations } from './util/replicants';

export const eventInfo: EventInfo[] = [];
const eventConfig = (nodecg().bundleConfig as Configschema).event;
const config = (nodecg().bundleConfig as Configschema).tracker;
let cookies: NeedleResponse['cookies'];

/**
 * Returns tracker cookies, if set.
 */
export function getCookies(): NeedleResponse['cookies'] {
  return cookies;
}

/**
 * Translates the short event name into the numerical ID from the tracker, if it exists.
 * @param short Short event name in the tracker.
 */
async function getEventIDFromShort(short: string): Promise<number> {
  const resp = await needle(
    'get',
    `https://${config.address}/search/?short=${short}&type=event`,
    cookies,
  );
  if (!resp.body.length) {
    throw new Error(`Event "${short}" does not exist on the tracker`);
  }
  return resp.body[0].pk;
}

/**
 * Updates donation total from the API as a backup for the RabbitMQ messages.
 */
async function updateDonationTotalFromAPI(): Promise<void> {
  try {
    let total = 0;
    for (const event of eventInfo) {
      const resp = await needle('get', `https://${config.address}/${event.id}?json`);
      if (resp.statusCode === 200) {
        const eventTotal = resp.body.agg.amount ? parseFloat(resp.body.agg.amount) : 0;
        event.total = eventTotal;
        total += eventTotal;
      }
    }
    if (donationTotal.value !== total) {
      nodecg().log.info('[Tracker] API donation total changed: $%s', total);
      donationTotal.value = total;
    }
  } catch (err) {
    nodecg().log.warn('[Tracker] Error updating donation total from API');
    nodecg().log.debug('[Tracker] Error updating donation total from API:', err);
  }
}

// Triggered when a donation total is updated in our tracker.
evt.on('donationTotalUpdated', (data) => {
  let total = 0;
  for (const event of eventInfo) {
    if (data.event === event.short) {
      event.total = data.new_total;
    }
    total += event.total;
  }
  if (donationTotal.value !== total) {
    nodecg().log.debug('[Tracker] Updated donation total received: $%s', total.toFixed(2));
    donationTotal.value = total;
  }
});

// Triggered when a new donation is fully processed on the tracker.
evt.on('donationFullyProcessed', (data) => {
  if (data.comment_state === 'APPROVED') {
    // eslint-disable-next-line no-underscore-dangle
    nodecg().log.debug('[Tracker] Received new donation with ID %s', data._id);
    nodecg().sendMessage('newDonation', data);
    if (data.amount >= 20) { // Notable donations are over $20
      notableDonations.value.unshift(data);
      notableDonations.value.length = Math.min(notableDonations.value.length, 20);
    }
  }
});

let isFirstLogin = true;
async function loginToTracker(): Promise<void> {
  if (isFirstLogin) {
    nodecg().log.info('[Tracker] Logging in');
  } else {
    nodecg().log.info('[Tracker] Refreshing session');
  }

  const loginURL = `https://${config.address}/admin/login/`;
  try {
    // Access login page to get CSRF token.
    const resp1 = await needle('get', loginURL);
    if (resp1.statusCode !== 200) {
      throw new Error('Could not access the tracker log in page');
    }

    // POST using the CSRF token alongside the username/password.
    const resp2 = await needle(
      'post',
      loginURL,
      {
        username: config.username,
        password: config.password,
        csrfmiddlewaretoken: (resp1.cookies) ? resp1.cookies.csrftoken : undefined,
      },
      {
        cookies: resp1.cookies,
        headers: {
          referer: loginURL,
        },
      },
    );

    // If we're not being redirected or there's no session token, the login failed.
    if (resp2.statusCode !== 302 || (resp2.cookies && !resp2.cookies.tracker_session)) {
      throw new Error('Log in was unsuccessful, is your username/password correct?');
    }

    // Store cookie for later use.
    cookies = resp2.cookies;

    if (isFirstLogin) {
      isFirstLogin = false;
      nodecg().log.info('[Tracker] Successfully logged in');
    } else {
      nodecg().log.info('[Tracker] Successfully refreshed session');
    }

    // Tracker logins expire every 2 hours (apparently?). Re-login every 90 minutes.
    setTimeout(loginToTracker, 90 * 60 * 1000);
  } catch (err) {
    nodecg().log.warn('[Tracker] Error authenticating');
    nodecg().log.debug('[Tracker] Error authenticating:', err);
    if (!isFirstLogin) {
      setTimeout(loginToTracker, 60 * 1000);
    }
    throw new Error('Could not log in successfully');
  }
}

async function init(): Promise<void> {
  if (!eventConfig.shorts.length) {
    nodecg().log.warn('[Tracker] No events found in configuration to query for');
    return;
  }
  try {
    nodecg().log.info('[Tracker] Setting up');

    // Go through all events and compile the important info for them.
    const events = (Array.isArray(eventConfig.shorts)) ? eventConfig.shorts : [eventConfig.shorts];
    for (const short of events) {
      const id = await getEventIDFromShort(short);
      eventInfo.push({
        id,
        short,
        total: 0,
      });
    }

    await loginToTracker();

    // Get initial total from API and set an interval as a fallback.
    updateDonationTotalFromAPI();
    setInterval(updateDonationTotalFromAPI, 60 * 1000);

    /* eslint-disable global-require */
    require('./tracker-bids').setup();
    require('./tracker-prizes').setup();
    require('./tracker-donations').setup();
    /* eslint-enable */
  } catch (err) {
    nodecg().log.warn('[Tracker] Error setting up');
    nodecg().log.debug('[Tracker] Error setting up:', err);
  }
}

if (config.enable) {
  init();
}
