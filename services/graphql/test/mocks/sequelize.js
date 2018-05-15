import { stub } from 'sinon';

export class MockInstance {
  constructor (data = {}) {
    Object.keys(data).forEach(key => {
      this[key] = data[key]
    });
  }
}

export class MockTransaction {
  constructor () {}
}
