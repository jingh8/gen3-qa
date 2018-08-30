const request = require('request');

// Set hostname according to namespace
let subdomain = process.env.NAMESPACE;
if (subdomain === '' || subdomain === undefined) {
  throw Error('NAMESPACE environment variable must be set.');
}
if (subdomain === 'default') {
  subdomain = 'qa';
}
process.env.HOSTNAME = `${subdomain}.planx-pla.net`;

exports.config = {
  output: './output',
  helpers: {
    WebDriverIO: {
      url: `https://${process.env.HOSTNAME}`,
      smartWait: 5000,
      browser: 'chrome',
      desiredCapabilities: {
        chromeOptions: {
          args: ['--headless', '--disable-gpu', '--window-size=1000,900'],
        },
      },
      restart: false,
      timeouts: {
        script: 6000,
        'page load': 10000,
      },
      port: 4444,
    },
    REST: {
      endpoint: `https://${process.env.HOSTNAME}`,
      defaultHeaders: '',
    },
    CDISHelper: {
      require: './cdisHelper.js',
    },
  },
  include: {
    // General Helpers
    commons: './actors/commonsHelper.js',
    nodes: './actors/nodesHelper.js',
    users: './actors/usersHelper.js',

    // APIs
    sheepdog: './actors/apis/sheepdog/sheepdogActor.js',
    indexd: './actors/apis/indexd/indexdActor.js',
    peregrine: './actors/apis/peregrine/peregrineActor.js',
    fence: './actors/apis/fence/fenceActor.js',

    // Pages
    dict: './actors/portal/dict/dict_actor.js',
    home: './actors/portal/home/home_actor.js',
  },
  mocha: {
    reporterOptions: {
      mochaFile: 'output/result.xml',
    },
  },
  bootstrap: './test_setup.js',
  teardown() {
    // session id is a global var retrieved in the helper
    console.log(`Killing Selenium session ${seleniumSessionId}`);
    request.del(`http://localhost:4444/wd/hub/session/${seleniumSessionId}`);
  },
  hooks: [],
  tests: './suites/*/*.js',
  timeout: 10000,
  name: 'selenium',
};
