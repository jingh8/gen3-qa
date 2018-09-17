const uuid = require('uuid');

const indexdProps = require('./indexdProps.js');
const usersUtil = require('../../../utils/usersUtil.js');
const { Gen3Response } = require('../../../utils/apiUtil.js');

const I = actor();

/**
 * indexd Utils
 */
const getRevFromResponse = function (res) {
  try {
    return res.body.rev;
  } catch (e) {
    return 'ERROR_GETTING_INDEXD';
  }
};

/**
 * indexd Tasks
 */
module.exports = {
  /**
   * Adds files to indexd
   * @param {Object[]} files - array of indexd files
   * @returns {Promise<void>}
   */
  async addFileIndices(files) {
    const headers = usersUtil.mainAcct.indexdAuthHeader;
    headers['Content-Type'] = 'application/json; charset=UTF-8';
    files.forEach((file) => {
      file.did = uuid.v4().toString();
      const data = {
        file_name: file.filename,
        did: file.did,
        form: 'object',
        size: file.size,
        urls: [],
        hashes: { md5: file.md5 },
        acl: file.acl,
        metadata: file.metadata,
      };

      if (file.link !== null && file.link !== undefined) {
        data.urls = [file.link];
      }

      const strData = JSON.stringify(data);
      I.sendPostRequest(indexdProps.endpoints.add, strData, headers).then(
        (res) => {
          file.rev = res.body.rev;
        },
      );
    });
  },

  /**
   * Fetches indexd data for file and assigns 'rev', given an indexd file object with a did
   * @param {Object} fileNode - Assumed to have a did property
   * @returns {Promise<Gen3Response>}
   */
  async getFile(file) {
    // get data from indexd
    return I.sendGetRequest(
      `${indexdProps.endpoints.get}/${file.did}`,
      usersUtil.mainAcct.accessTokenHeader,
    ).then((res) => {
      file.rev = getRevFromResponse(res);
      return new Gen3Response(res);
    });
  },

  /**
   * Deletes the file from indexd, given an indexd file object with did and rev
   * Response is added to the file object
   * @param {Object} file
   * @returns {Promise<Promise|*|PromiseLike<T>|Promise<T>>}
   */
  async deleteFile(file) {
    return I.sendDeleteRequest(
      `${indexdProps.endpoints.delete}/${file.did}?rev=${file.rev}`,
      usersUtil.mainAcct.indexdAuthHeader,
    ).then((res) => {
      // Note that we use the entire response, not just the response body
      const g3res = new Gen3Response(res);
      file.indexdDeleteRes = g3res;
      return g3res;
    });
  },

  /**
   * Deletes multiple files from indexd
   * @param {Object[]} files
   * @returns {Promise<void>}
   */
  async deleteFileIndices(files) {
    files.forEach((file) => {
      this.deleteFile(file);
    });
  },
};
