# themeathon-layouts

> The on-screen graphics used during marathon events.

*This is a bundle for [NodeCG](https://nodecg.dev); if you do not understand what that is, we advise you read their website first for more information.*

***This documentation isn't fully complete and may have errors, but intends to be as correct as possible.***

This is a [NodeCG](https://nodecg.dev) v1.8.1 bundle. You will need to have NodeCG v1.8.1 or above installed to run it. It also requires you to install the [nodecg-speedcontrol](https://github.com/speedcontrol/nodecg-speedcontrol) bundle (of which you may also need to install the latest changes instead of the most stable release).

## Installation

You will need [Node.js](https://nodejs.org) (18.x LTS tested) and [git](https://git-scm.com/) installed to install NodeCG, then see the [NodeCG documentation](https://www.nodecg.dev/docs/installing) on how to install that. I also suggest installing `nodecg-cli`; information on that is also on the documentation just linked (**the guide below will assume you have done this!**). You may also need to install the appropriate build tools for whichever platform you are running on; for example if you are on Windows you can either install it while installing Node.js, or using [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools).

Next, clone the `build` branch of this repository into the NodeCG `bundles` folder and install the dependencies:
> ```
> cd bundles
> git clone https://github.com/Themeathon/themeathon-layouts.git --branch themeathon-base
> cd themeathon-layouts
> npm install --production
> ```

You will probably also want a default configuration you can fill in, which can be created using:
> `nodecg defaultconfig`.

Then, to get the most recent changes for [nodecg-speedcontrol](https://github.com/speedcontrol/nodecg-speedcontrol), clone the `build` branch and install dependencies, similar to above:
> ```
> cd ..
> git clone https://github.com/speedcontrol/nodecg-speedcontrol.git --branch build
> cd nodecg-speedcontrol
> npm install --production
> ```

In addition, to have the `videos` assets automatically audio normalised, you must have `python` (v3), `ffmpeg`, and [`ffmpeg-normalize`](https://github.com/slhck/ffmpeg-normalize) available in your system's `PATH`. If you don't have all of these, the check will fail and videos will just not be touched. For Windows, `python` (v3) should be automatically installed when you install Node.js built tools, if you chose to do that.

## Usage

*Not everything you can set is documented here; if you're an advanced user we advise you take a look at the included [configschema.json](configschema.json) file.*

This bundle heavily relies on the [obs-websocket](https://github.com/Palakis/obs-websocket) plugin, so make sure you have this installed (custom address/port and password can be specified in the bundle's config if needed).

This bundle also heavily relies on information from a RabbitMQ server, and an instance of our fork of the [GamesDoneQuick donation tracker](https://github.com/esamarathon/donation-tracker).

### Stream Deck Plugin

Included with this bundle is a plugin for the Elgato Stream Deck software that can be used by various crew members during events. Once you have the Stream Deck software installed, you can install the plugin by running the file `com.esamarathon.streamdeck.streamDeckPlugin` in the `streamdeck-plugin/Release` directory. Currently, you need to set the actions up yourself in the software, so it can easily be customised on the fly.

### FlagCarrier Configuration

You will need to install the [speedcontrol-flagcarrier](https://github.com/speedcontrol/speedcontrol-flagcarrier) bundle to use this part, along with using one of the FlagCarrier applications to set them.

**Hosts (the ones on camera):**
- group_id: `hosts`
- positions: `left,midleft,middle,midright,right`

### Text-To-Speech Donations

This can be enabled via the config, controlled via Stream Deck buttons available in the included extension, and the graphic files `tts.html` will play them when requested. You will need to set a specific URL for the `voiceAPI` setting in the config though, so unless you know this it's somewhat useless, sorry.

### Music Player

This bundle can interface with [foobar2000](https://www.foobar2000.org/) using the [beefweb](https://github.com/hyperblast/beefweb) plugin. Set up foobar2000 however you want it to play music (we use a long playlist on shuffle, and set a fade in/out on pause), make sure the correct username/password are set in the configuration fiole, and this bundle with automatically play music when needed. It will only play if the scene name ends in `[M]`, for example, `Intermission [M]`.

### Credits

* Country flags sourced from [speedrun.com](https://www.speedrun.com/).
* [clip.ts](src/graphics/_misc/clip.ts), modified from a version originally written by [Hoishin](https://github.com/hoishin).
