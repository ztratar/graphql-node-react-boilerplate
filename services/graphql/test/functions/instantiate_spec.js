import { expect } from 'chai';

import MockModel from '../mocks/model';
import { MockInstance, MockTransaction } from '../mocks/sequelize';

import instantiate from '../../src/functions/instantiate';

describe('instantiate', () => {
  let mockModel = null;
  beforeEach(() => {
    mockModel = new MockModel();
  });
  context('data is null', () => {
    let instantiateMockModel = null;
    beforeEach(() => {
      instantiateMockModel = instantiate(mockModel);
    });
    it('resolves to null', async () => {
      expect(await instantiateMockModel(null)).to.be.null;
      expect(mockModel.findById.called).to.be.false;
      expect(mockModel.create.called).to.be.false;
    });
  });
  context('data is instance of model', () => {
    let mockInstance = null
      , instantiateMockModel = null;
    beforeEach(() => {
      mockModel.setInstanceOfReturn(true);
      mockInstance = new MockInstance();
      instantiateMockModel = instantiate(mockModel);
    });
    it('resolves to data', async () => {
      expect(await instantiateMockModel(mockInstance)).to.equal(mockInstance);
      expect(mockModel.isInstance.calledWith(mockInstance)).to.be.true;
    });
  });
  context('data is not an instance of model but contains an id', () => {
    let mockInstance = null
      , mockTransaction = null
      , instantiateMockModel = null;
    beforeEach(() => {
      mockInstance = new MockInstance();
      mockTransaction = new MockTransaction();
      mockModel.setFindByIdReturn(mockInstance);
      instantiateMockModel = instantiate(mockModel);
    })
    it('calls, and resolves to, Model.findById passing data.id and the transaction', async () => {
      const id = 'foo';
      expect(await instantiateMockModel({ id }, mockTransaction)).to.equal(mockInstance);
      expect(mockModel.findById.calledWith(id, mockTransaction)).to.be.true;
    });
  });
  context('data does not contain an id', () => {
    let data = null
      , mockInstance = null
      , mockTransaction = null;
    beforeEach(() => {
      data = {
        foo: 'bar'
      };
      mockInstance = new MockInstance();
      mockTransaction = new MockTransaction();
      mockModel.setCreateReturn(mockInstance);
    });
    context('create is not disabled', () => {
      let instantiateMockModel = null;
      beforeEach(() => {
        instantiateMockModel = instantiate(mockModel);
      });
      it('calls, and resolves to, Model.create passing data and the transaction', async () => {
        expect(await instantiateMockModel(data, mockTransaction)).to.equal(mockInstance);
        expect(mockModel.create.calledWith(data, mockTransaction)).to.be.true;
      });
    });
    context('create is disabled', () => {
      let instantiateMockModel = null;
      beforeEach(() => {
        instantiateMockModel = instantiate(mockModel, {
          create: false
        });
      });
      it('resolves to null', async () => {
        expect(await instantiateMockModel(data, mockTransaction)).to.be.null;
        expect(mockModel.create.called).to.be.false;
      });
    });
  });
});
