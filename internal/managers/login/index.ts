import { access, chmod } from 'fs/promises';
import path from 'path';
import os from 'os';

import * as tc from '@actions/tool-cache';
import * as core from '@actions/core';
import axios from 'axios';

import { Actions, Manager, Parameters } from '../../interfaces';
import { BaseManager } from '../base';

import { LoginResult } from './interfaces';

export class LoginManager extends BaseManager implements Manager {
  public get action(): Actions {
    return Actions.login;
  }

  public async run(params: Parameters): Promise<LoginResult> {
    if (!params.ip) {
      throw new Error('ip parameter is required');
    }

    if (!params.port) {
      throw new Error('port parameter is required');
    }

    if (!params.username) {
      throw new Error('username parameter is required');
    }

    if (!params.password) {
      throw new Error('password parameter is required');
    }

    const res = await axios.post(
      `https://${params.ip}:${params.port}/api/v1/session`,
      {
        username: params.username,
        password: params.password
      },
    );

    if (res.status !== 200) {
      throw new Error('Invalid request');
    }

    return {
      token: res.data.token,
    };
  }
}
