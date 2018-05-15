export default class BaseModel {
  constructor () {
    this._peerModels = {};
  }
  destructor () {
    this._peerModels = {}; // reset the hash to release references and allow garbage collection
  }
  injectPeerModels (models = {}) {
    Object.keys(models).forEach((key) => {
      this._peerModels[key] = models[key];
    });
  }
}
