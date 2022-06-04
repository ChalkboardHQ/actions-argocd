export enum Actions {
  none = '',
  install = 'install',
}

export interface Parameters {
  action: Actions;
  version?: string;
}

export interface Result {}

export interface Manager {
  readonly action: Actions
  run(params: Parameters): Promise<Result>;
}
