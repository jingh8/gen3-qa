/*
 Access GUI tests (PXP-6822)
 This test plan has a few pre-requisites:
 1. The Access Backend component must be declared in the environment's manifest
    "versions": {
      "access-backend": "quay.io/cdis/access-backend:1.0",
 2. The following artifacts must be created by the env. admin under the gen3 secrets folder:
    $ ls $GEN3_SECRETS_PATH/access-backend/
    access-backend.env  dbcreds.json  user.yaml
 3. Test Credentials:
    - SUPER_ADMIN: Declared in the "access-backend.env" file.
      e.g., export SUPER_ADMINS='cdis.autotest@gmail.com'
    - ADMIN: Added through the Access GUI.
*/
Feature('Access GUI');

const { expect } = require('chai');
const stringify = require('json-stringify-safe');
const { interactive, ifInteractive } = require('../../utils/interactive.js');
const {
  getAccessTokenHeader, requestUserInput, sleepMS, parseJwt,
} = require('../../utils/apiUtil');

const ACCESS_API_ENDPOINT = process.env.ACCESS_API_ENDPOINT || 'https://qa-anvil.planx-pla.net';
const ACCESS_FRONTEND_ENDPOINT = process.env.ACCESS_FRONTEND_ENDPOINT || 'https://access-test.planx-pla.net';
const USERS_GITHUB_REPO = process.env.USERS_GITHUB_REPO || 'commons-users';

const dataSetsRaw = [
  'phs000424.c1 phs000424.c1 CF-GTEx',
  'phs001272.c1 phs001272.c1 CMG-Broad-GRU',
  'phs001272.c2 phs001272.c2 CMG-Broad-DS-KRD-RD',
  'phs001272.c3 phs001272.c3 CMG-Broad-HMB-MDS',
  'phs001272.c4 phs001272.c4 CMG-Broad-DS-NIC-EMP-LENF',
];

BeforeSuite((I) => {
  console.log('Setting up dependencies...');
  I.cache = {};

  if (process.env.GITHUB_TOKEN === undefined) {
    throw new Error('ERROR: There is no github token defined. This test runs some asserttions related to Pull Requests creation, hence, it requires github creds to');
  }
   
  I.cache.dataSets = [];

  dataSetsRaw.forEach((dataSet) => {
    const [phsConsent, authId, fullName] = dataSet.split(' ');
    const [program, project] = fullName.split(/-(.+)/);
    I.cache.dataSets.push({
      name: fullName,
      phsid: phsConsent,
      authid: authId,
      program,
      project,
    });
  });
});

/*
// Create Datasets in ACCESS
Scenario('Given a payload with minimal info, parse and create data sets in ACCESS backend. @manual', ifInteractive(
  async (I) => {
    let createDataSetsResp;
    if (!I.cache.ACCESS_TOKEN) I.cache.ACCESS_TOKEN = await requestUserInput('Please provide your ACCESS_TOKEN: ');
    for (const [_, dataSet] of Object.entries(I.cache.dataSets)) {
      const deleteDataSetsResp = await I.sendDeleteRequest(
        `${ACCESS_API_ENDPOINT}/access-backend/datasets/${dataSet.phsid}`,
        getAccessTokenHeader(I.cache.ACCESS_TOKEN),
      ); // ignore failures (in case dataSets do not exist)

      createDataSetsResp = await I.sendPostRequest(
        `${ACCESS_API_ENDPOINT}/access-backend/datasets`,
        dataSet,
        getAccessTokenHeader(I.cache.ACCESS_TOKEN),
      );
    }
    const dataSetsCheckResp = await I.sendGetRequest(
      `${ACCESS_API_ENDPOINT}/access-backend/datasets`,
      getAccessTokenHeader(I.cache.ACCESS_TOKEN),
    );

    expect(dataSetsCheckResp).to.have.property('status', 200);
    const result = await interactive(`
            1. [Automated] Something something
                HTTP POST request to: ${ACCESS_API_ENDPOINT}/access-backend/datasets
            Manual verification:
              Response status: ${dataSetsCheckResp.status} // Expect a HTTP 200
              Response data: ${JSON.stringify(dataSetsCheckResp.data)}
                // Expect data sets
            `);
    expect(result.didPass, result.details).to.be.true;
  },
));
*/

// GUI Testing
Scenario('Super Admin: login + edit, delete, add Admin and export TSV. @manual', ifInteractive(
  async (I) => {
    if (!I.cache.ACCESS_TOKEN) I.cache.ACCESS_TOKEN = await requestUserInput('Please provide your ACCESS_TOKEN: ');
    const accessTokenJson = parseJwt(I.cache.ACCESS_TOKEN);

    I.amOnPage(ACCESS_API_ENDPOINT);
    await I.setCookie({ name: 'dev_login', value: accessTokenJson.context.user.name });

    // login
    I.amOnPage(ACCESS_FRONTEND_ENDPOINT);
    I.click({ xpath: 'xpath: //button[contains(text(), \'Login from Google\')]' });
    I.saveScreenshot('Super_Admin_consent_page.png');
    I.waitForElement({ css: '.auth-list' }, 20);
    I.click({ xpath: 'xpath: //button[contains(text(), \'Yes, I authorize.\')]' });
    await sleepMS(3000);
    await I.seeElement({ css: '.ReactVirtualized__Table__rowColumn' }), 10;
    await I.saveScreenshot('Super_Admin_login_main_page.png');
    await sleepMS(1000);
/*
    // edit
    I.click({ xpath: 'xpath: //button[contains(text(), \'Edit\')]'});
    I.scrollIntoView('.form-info__user-access');
    await I.saveScreenshot('Edit_user.png');
    await sleepMS(1000);
    I.checkOption({ xpath: 'xpath: //input[@type="checkbox"]'});
    await I.saveScreenshot('Granting_access_to_data_set.png');
    I.click({ xpath: 'xpath: //button[contains(text(), \'Save\')]'});

    await I.seeElement({ css: '.high-light' });
    const successfullyEditedUserMsg = await I.grabTextFrom({ css: '.high-light' });
    expect(successfullyEditedUserMsg).to.include('Successfully updated user');

    // check if the PR was created
    const getNumbersOfRecentPRs = await I.sendGetRequest(
      `https://api.github.com/repos/uc-cdis/${USERS_GITHUB_REPO}/pulls?per_page=10`,
      {
        Accept: 'application/json',
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    );
    // console.log(`getNumbersOfRecentPRs: ${stringify(getNumbersOfRecentPRs)}`);
    const sortedPRsList = getNumbersOfRecentPRs.data.sort((function (a, b) { 
      return new Date(b.created_at) - new Date(a.created_at);
    }));
    const mostRecentPR = sortedPRsList[0];
    console.log(`most recent PR: ${stringify(mostRecentPR)}`);
*/
    // to be removed later
    const mostRecentPR = { url: 'meh', created_at: 'mehmeh'};
      
    // Add admin
    I.scrollPageToTop();
    I.click({ xpath: 'xpath: //div[@class=\'manage-users__tab\' and contains(text(), \'Add a New User\')]'});
    await I.saveScreenshot('Before_creating_new_admin_user.png');
    I.click('.form-info__detail-select__control');
    //I.fillField({ xpath: 'xpath: //div[@class=\'form-info__detail-select__placeholder\' and contains(text(), \'Select the login ID for this user\')]/input' },'Google email');
    await I.saveScreenshot('Creating_new_admin_user.png');
    I.click('#react-select-2-option-0') // select 'Google mail' option

    I.fillField({ xpath: 'xpath: //input[@class=\'form-info__detail-input\']/preceding-sibling::label[contains(text(), \'Name *\')]' }, 'Arnold Schwarzenegger');
    await I.saveScreenshot('Create_admin_user_form_test_1.png');
    I.fillField({ xpath: 'xpath: //input[@class=\'form-info__detail-input\'][position()=2]' }, 'Get to the choppa, now');
    I.fillField({ xpath: 'xpath: //input[@class=\'form-info__detail-input\'][position()=3]' }, 'ASCHWAR');
    I.fillField({ xpath: 'xpath: //input[@class=\'form-info__detail-input\'][position()=4]' }, '0000-0003-3292-0780'); // fictitious ORCID
    I.fillField({ xpath: 'xpath: //input[@class=\'form-info__detail-input\'][position()=5]' }, 'cdis.autotest@gmail.com');
    I.fillField({ xpath: 'xpath: //input[@class=\'form-info__detail-input\'][position()=6]' }, 'cdis.autotest@gmail.com');
    I.fillField({ xpath: 'xpath: //input[@class=\'form-info__detail-input\'][position()=7]' }, '2021/10/19');
    I.scrollIntoView('.form-info__user-access');
    await sleepMS(1000);
    I.checkOption({ xpath: 'xpath: //input[@type="checkbox"]'});
    await I.saveScreenshot('Create_admin_user_form_fully_filled.png');

   /*    const password = await I.grabTextFrom('#password'); */

    // delete

    const result = await interactive(`
            1. [Login] Check screenshot and make sure it shows the Access GUI
               containing a list of Admin / PI users.
            Manual verification:
                // Look at the screenshot (Super_Admin_login_main_page.png) 
                // inside your 'output' folder.
            2. [Edit] Check if a PR was created by the Edit User operation:
            Manual verification:
                // url: ${mostRecentPR.url}
                // timestamp: ${mostRecentPR.created_at}
            3. [Create] Check if a PR was created by the Edit User operation:
            Manual verification:
                // url: ${mostRecentPR.url}
                // timestamp: ${mostRecentPR.created_at}
            4. [Delete] Check if a PR was created by the Edit User operation:
            Manual verification:
                // url: ${mostRecentPR.url}
                // timestamp: ${mostRecentPR.created_at}
            `);
    expect(result.didPass, result.details).to.be.true;
  },
));

/*
// GUI Testing
Scenario('Admin: login + add user, export TSV Edit. @manual', ifInteractive(
  async (I) => {
    if (!I.cache.ACCESS_TOKEN) I.cache.ACCESS_TOKEN = await requestUserInput('Please provide your ACCESS_TOKEN: ');
    // TODO
    const result = await interactive(`
            1. [Automated] Something something
                HTTP POST request to: ${ACCESS_API_ENDPOINT}/datasets
            Manual verification:
              Response status: ${createDataSetsResp.status} // Expect a HTTP 200
              Response data: ${JSON.stringify(createDataSetsResp.body)}
                // Expect something
            `);
    expect(result.didPass, result.details).to.be.true;
  },
));

// GUI Testing
Scenario('Super Admin: login again + check if Users are visible under Admin. @manual', ifInteractive(
  async (I) => {
    if (!I.cache.ACCESS_TOKEN) I.cache.ACCESS_TOKEN = await requestUserInput('Please provide your ACCESS_TOKEN: ');
    // TODO
    const result = await interactive(`
            1. [Automated] Something something
                HTTP POST request to: ${ACCESS_API_ENDPOINT}/datasets
            Manual verification:
              Response status: ${createDataSetsResp.status} // Expect a HTTP 200
              Response data: ${JSON.stringify(createDataSetsResp.body)}
                // Expect something
            `);
    expect(result.didPass, result.details).to.be.true;
  },
));

// GUI Testing
Scenario('Admin: login again + edit and delete user. @manual', ifInteractive(
  async (I) => {
    if (!I.cache.ACCESS_TOKEN) I.cache.ACCESS_TOKEN = await requestUserInput('Please provide your ACCESS_TOKEN: ');
    // TODO
    const result = await interactive(`
            1. [Automated] Something something
                HTTP POST request to: ${ACCESS_API_ENDPOINT}/datasets
            Manual verification:
              Response status: ${createDataSetsResp.status} // Expect a HTTP 200
              Response data: ${JSON.stringify(createDataSetsResp.body)}
                // Expect something
            `);
    expect(result.didPass, result.details).to.be.true;
  },
));*/
