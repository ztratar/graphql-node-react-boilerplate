import { info } from '../io/logger';

export default class Context { //NOTE: Basically a thread local for every request
  constructor ({ models, user, opticsContext }) {
    this.models = models;
    this.user = user;
    this.opticsContext = opticsContext;

    info(`created context for user "${this.user && this.user.id ? this.user.id : 'anonymous'}"`);
  }
  destructor () {
    const models = this.models;
    const user = this.user;
    this.models = null;
    this.user = null;
    Object.keys(models).forEach((key) => models[key].destructor ? models[key].destructor() : null);
    info(`destructed contect for user "${user && user.id ? user.id : 'anonymous'}"`);
  }
}
