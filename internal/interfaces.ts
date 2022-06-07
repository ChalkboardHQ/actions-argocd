export enum Actions {
  none = '',
  install = 'install',
  login = 'login',
  projectCreate = 'projectCreate',
}

export interface Parameters {
  action: Actions;
  upsert: boolean;
  version?: string;
  ip?: string;
  username?: string;
  password?: string;
  port?: string;
  token?: string;
  name?: string;
}

export interface Result {}

export interface Manager {
  readonly action: Actions
  run(params: Parameters): Promise<Result>;
}
