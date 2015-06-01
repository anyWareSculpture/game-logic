/*eslint no-unused-expressions: 0, no-new: 0 */
// The above is done in order to support chai assertion syntax without lint errors

const sinon = require('sinon');
const expect = require('chai').expect;
const rewire = require('rewire');

const VersionedStore = rewire('../src/versioned-store');

describe('VersionedStore', () => {
  it('should work', () => {
  });
});
