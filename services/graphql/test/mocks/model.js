import { stub } from 'sinon';

export default class MockModel {
  constructor () {
    this._instanceOfReturn = false;
    this._findByIdReturn = null;
    this._createReturn = null;

    this.instanceOf = stub(this, 'isInstance', () => this._instanceOfReturn);
    this.findById = stub(this, 'findById', async () => this._findByIdReturn);
    this.create = stub(this, 'create', async () => this._createReturn);
  }
  setInstanceOfReturn (bool) {
    this._instanceOfReturn = bool;
  }
  setFindByIdReturn (val) {
    this._findByIdReturn = val;
  }
  setCreateReturn (val) {
    this._createReturn = val;
  }
  isInstance () {}
  async findById () {}
  async create () {}
}
