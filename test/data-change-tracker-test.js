/*eslint no-unused-expressions: 0, no-new: 0 */
// The above is done in order to support chai assertion syntax without lint errors

const expect = require('chai').expect;
const rewire = require('rewire');

const DataChangeTracker = rewire('../src/utils/data-change-tracker');

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
    const data = new DataChangeTracker();

    expect(data.getChangedPropertyNames()).to.be.empty;
    expect(data.getChangedOldValues()).to.be.empty;
    expect(data.getChangedCurrentValues()).to.be.empty;
  });

  it('should save old and current values for each change', () => {
    const data = new DataChangeTracker();

    const propertyName = "test1345";
    const oldValue = "oldvalue";
    const newValue = "newvalue";

    data.set(propertyName, oldValue);
    data.set(propertyName, newValue);
    expect(data.get(propertyName)).to.equal(newValue);
    expect(data.getChangedPropertyNames()).to.have.length(1);
    expect(data.getChangedPropertyNames()).to.have.members([propertyName]);
    expect(data.getChangedOldValues()[propertyName]).to.equal(oldValue);
    expect(data.getChangedCurrentValues()[propertyName]).to.equal(newValue);
    expect(data.getChangedCurrentValues()[propertyName]).to.equal(data.get(propertyName));
  });

  it('should allow clearing of any currently registered changes', () => {
    const data = new DataChangeTracker();

    data.set("a", 0);
    data.set("b", 0);
    data.set("c", 0);

    expect(data.getChangedCurrentValues()).to.be.empty;

    data.set("a", 1);
    data.set("b", 2);
    data.set("c", 3);

    expect(data.getChangedCurrentValues()).to.eql({a: 1, b: 2, c: 3});

    data.clearChanges();

    expect(data.getChangedCurrentValues()).to.be.empty;
  });

  it('should store changed property names correctly', () => {
    const data = new DataChangeTracker();

    const propertyNames = ["abc", "test", "qqq", "helloworld"];
    for (let name of propertyNames) {
      data.set(name, 1);
      data.set(name, 3);
    }

    expect(data.getChangedPropertyNames()).to.eql(propertyNames);
  });

  it('should register changes even if the same value is set twice', () => {
    const data = new DataChangeTracker();

    const name = "abc";

    data.set(name, 1);
    expect(data.getChangedCurrentValues()).to.be.empty;
    data.set(name, 2);
    expect(data.getChangedCurrentValues()[name]).to.equal(2);
    data.set(name, 2);
    expect(data.getChangedCurrentValues()[name]).to.equal(2);
    data.set(name, 2);
    expect(data.getChangedCurrentValues()[name]).to.equal(2);
  });
});
