const { Gen3Response } = require('../apiHelper');

/**
 * fence Properties
 */
const rootEndpoint = '/user';
module.exports = {
  endpoints: {
    root: rootEndpoint,
    getFile: `${rootEndpoint}/data/download`,
    createAPIKey: `${rootEndpoint}/credentials/api/`,
    deleteAPIKey: `${rootEndpoint}/credentials/api/cdis`,
    getAccessToken: `${rootEndpoint}/credentials/api/access_token`,
    linkGoogle: `${rootEndpoint}/link/google?redirect=.`,
    deleteGoogleLink: `${rootEndpoint}/link/google`,
    extendGoogleLink: `${rootEndpoint}/link/google`,
  },

  linkErrors: {
    noGoogleAcctLinked: {
      statusCode: 404,
      error: 'g_acnt_link_error',
      error_description:
        "Couldn't unlink account for user, no linked Google account found.",
    },
    linkedToAnotherAcct: {
      error: 'g_acnt_link_error',
      error_description: 'Could not link Google account. The account specified is already linked to a different user.',
    },
  },

  googleLogin: {
    readyCue: {
      locator: {
        text: 'Sign in with Google',
      },
    },
    emailField: {
      locator: {
        css: '#identifierId',
      },
    },
    emailNext: {
      locator: {
        css: '#identifierNext',
      },
    },
    passwordField: {
      locator: {
        css: 'input[type="password"]',
      },
    },
    passwordNext: {
      locator: {
        css: '#passwordNext',
      },
    },
    useAnotherAcctBtn: {
      locator: {
        xpath: '//div[contains(text(), \'Use another account\')]',
      },
    },
  },

  linkExtendAmount: 86400, // 24 hours (in seconds)

  resExpiredAccessToken: new Gen3Response({
    fenceError: 'Authentication Error: Signature has expired',
    statusCode: 401,
  }),

  resInvalidAPIKey: new Gen3Response({
    fenceError: 'Not enough segments',
    statusCode: 401,
  }),

  resMissingAPIKey: new Gen3Response({
    fenceError: 'Please provide an api_key in payload',
    statusCode: 400,
  }),

  resMissingFilePermission: new Gen3Response({
    fenceError: "You don't have access permission on this file",
    statusCode: 401,
  }),

  resInvalidFileProtocol: new Gen3Response({
    fenceError: 'The specified protocol s2 is not supported',
    statusCode: 400,
  }),

  resNoFileProtocol: new Gen3Response({
    fenceError: "Can't find any file locations.",
    statusCode: 404,
  }),
};