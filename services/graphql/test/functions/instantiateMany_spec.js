import { expect } from 'chai';

import MockModel from '../mocks/model';
import { MockInstance, MockTransaction } from '../mocks/sequelize';

import instantiateMany from '../../src/functions/instantiateMany';

describe('instantiateMany', () => {
  let mockModel = null
    , mockInstance = null
    , mockTransaction = null
    , instantiateManyMockModels = null;
  beforeEach(() => {
    mockModel = new MockModel();
    mockInstance = new MockInstance();
    mockTransaction = new MockTransaction();
    instantiateManyMockModels = instantiateMany(mockModel);
    mockModel.setCreateReturn(mockInstance);
  });
  it('calls, and resolves to, instantiate for each object in data passing the transaction', async () => {
    let data1 = { val: 'foo' }
      , data2 = { val: 'bar' };
    const ret = await instantiateManyMockModels([
      data1,
      data2
    ], mockTransaction);
    expect(ret[0]).to.equal(mockInstance);
    expect(ret[1]).to.equal(mockInstance);
    expect(mockModel.create.firstCall.args[0]).to.equal(data1);
    expect(mockModel.create.firstCall.args[1]).to.equal(mockTransaction);
    expect(mockModel.create.secondCall.args[0]).to.equal(data2);
    expect(mockModel.create.secondCall.args[1]).to.equal(mockTransaction);
  });
});
