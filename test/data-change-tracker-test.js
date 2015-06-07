/*eslint no-unused-expressions: 0, no-new: 0 */
// The above is done in order to support chai assertion syntax without lint errors

const sinon = require('sinon');
const expect = require('chai').expect;
const rewire = require('rewire');

const DataChangeTracker = rewire('../src/data-change-tracker');

describe('DataChangeTracker', () => {
  it('should not restrict property names when no arguments are passed in', () => {
    const data = new DataChangeTracker();

    expect(() => data.get("test")).to.not.throw(Error);
    expect(() => data.set("test", "somevalue")).to.not.throw(Error);
  });

  it('should restrict all property names when an empty argument is passed in', () => {
    const data = new DataChangeTracker({});

    expect(() => data.get("test")).to.throw(Error);
    expect(() => data.set("test", "somevalue")).to.throw(Error);
  });

  it('should restrict property names to what is passed in', () => {
    const data = new DataChangeTracker({abc: 56});

    expect(() => data.get("test")).to.throw(Error);
    expect(() => data.set("test", "somevalue")).to.throw(Error);

    expect(() => data.get("abc")).to.not.throw(Error);
    expect(() => data.set("abc", "value1")).to.not.throw(Error);
  });

  it('should get and set names correctly', () => {
    const data = new DataChangeTracker();
    
    const value = "somevalue1";
    data.set("test", value);
    expect(data.get("test")).to.equal(value);
    
    // It's important that the value can be changed once it is set once
    const someOtherValue = "someothervalue2";
    data.set("test", someOtherValue);
    expect(data.get("test")).to.equal(someOtherValue);
  });

  it('should provide default values appropriately', () => {
    const defaultValue = 23456;
    const data = new DataChangeTracker({abc: defaultValue});

    expect(data.get("abc")).to.equal(defaultValue);

    data.set("abc", 57);

    expect(data.get("abc")).to.not.equal(defaultValue);
  });

  it('should not have any changes registered initially', () => {

  });

  it('should save old and current values for each change', () => {
    // test get() == getChangedCurrentValues()
  });

  it('should allow clearing of any currently registered changes', () => {

  });

  it('should store changed property names correctly', () => {

  });

  it('should register changes even if the same value is set twice', () => {

  });
});
