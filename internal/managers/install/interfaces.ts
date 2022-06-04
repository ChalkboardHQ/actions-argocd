import { Result } from '../../interfaces';

export interface InstallResult extends Result {
  version: string;
}

export enum Executable {
  aix = '',
  android = '',
  cygwin = '',
  freebsd = '',
  netbsd = '',
  haiku = '',
  openbsd = '',
  sunos = '',
  darwin = 'argocd-darwin-amd64',
  linux = 'argocd-linux-amd64',
  win32 = 'argocd-windows-amd64.exe',
}
