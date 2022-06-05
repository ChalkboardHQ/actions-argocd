import path from 'path';

import glob from 'glob';
import * as core from '@actions/core';

import {
  Actions,
  Parameters,
  Manager,
} from './interfaces';
import { BaseManager } from './managers/base';

import { InstallManager } from './managers/install';

export class Dispatcher {
  private readonly params: Parameters;

  private static handlers: Partial<Record<Actions, Manager>> = {};

  constructor(params: Parameters) {
    this.params = params;
  }

  public async run(): Promise<void> {
    console.log('Dispatcher')
    // await this.initHandlers();
    this.init();

    const handler = Dispatcher.handlers[this.params.action];

    if (!handler) {
      return;
    }

    const result = await handler.run(this.params);

    core.setOutput(
      'result',
      JSON.stringify(result),
    );
  }

  public static register(action: Actions, manger: Manager): void {
    Dispatcher.handlers[action] = manger
  }

  private init(): void {
    new InstallManager();
  }

  private async initHandlers(): Promise<void> {
    const rootPath = path.resolve(
      path.join(
        __dirname,
        'managers',
      ),
    );
    const files = await new Promise<Array<string>>(
      (resolve, reject) => {
        glob(
          '**/index.@(ts|js)',
          {
            cwd: rootPath,
            ignore: 'base.@(ts|js)',
          },
          (err, items) => {
            if (err) {
              return reject(err);
            }

            return resolve(items);
          },
        );
      },
    );

    await Promise.all(
      files.map(async (file) => {
        const Class = await Dispatcher.load(path.join(
          rootPath,
          file,
        ));
        new Class();
      }),
    );
  }

  protected static async load(managerPath: string): Promise<typeof BaseManager> {
    const loaded = await import(managerPath);
    const className = Object.keys(loaded)
      .filter((key) => key)
      .pop();

    return loaded[className as string] as typeof BaseManager;
  }
}
