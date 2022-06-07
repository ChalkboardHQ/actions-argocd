import * as core from '@actions/core';

import { Actions, Parameters } from './interfaces';
import { Dispatcher } from './dispatcher';

function getParameters(): Parameters {
  const params: Parameters = {
    action: core.getInput('action') as Actions,
    upsert: core.getInput('upsert') === 'true',
  };

  const version = core.getInput('version');

  if (version !== '') {
    params.version = version;
  }

  const ip = core.getInput('ip');

  if (ip !== '') {
    params.ip = ip;
  }

  const port = core.getInput('port');

  if (port !== '') {
    params.port = port;
  }

  const username = core.getInput('username');

  if (username !== '') {
    params.username = username;
  }

  const password = core.getInput('password');

  if (password !== '') {
    params.password = password;
  }

  const name = core.getInput('name');

  if (name !== '') {
    params.name = name;
  }

  const token = core.getInput('token');

  if (token !== '') {
    params.token = token;
  }

  return params;
}

async function run(): Promise<void> {
  try {
    const dispatcher = new Dispatcher(getParameters());

    await dispatcher.run();
    core.info('end of run function call');
  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(e.message);
    }
  }
}

run()
  .then(() => core.info('call run function'))
  .catch((e) => core.setFailed(e.message));
