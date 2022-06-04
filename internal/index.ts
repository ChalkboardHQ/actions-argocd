import * as core from '@actions/core';

import { Actions, Parameters } from './interfaces';
import { Dispatcher } from './dispatcher';

function getParameters(): Parameters {
  const params: Parameters = {
    action: core.getInput('action') as Actions
  };

  const version = core.getInput('version');

  if (version !== '') {
    params.version = version;
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
