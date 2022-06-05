export enum Actions {
  none = '',
  install = 'install',
  login = 'login',
}

export interface Parameters {
  action: Actions;
  version?: string;
  ip?: string;
  username?: string;
  password?: string;
  port?: string;
}

export interface Result {}

export interface Manager {
  readonly action: Actions
  run(params: Parameters): Promise<Result>;
}
