import { Result } from '../../interfaces';

export interface LoginResult extends Result {
  token: string;
}
