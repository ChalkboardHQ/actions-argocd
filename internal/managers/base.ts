import { Dispatcher } from '../dispatcher';
import {
  Actions,
  Manager,
  Parameters,
  Result,
} from '../interfaces';

export class BaseManager implements Manager {
  public get action(): Actions {
    return Actions.none;
  }

  constructor() {
    Dispatcher.register(this.action, this);
  }

  public async run(params: Parameters): Promise<Result> {
    throw new Error('Not implemented')
  }
}
