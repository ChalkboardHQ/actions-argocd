import { access, chmod } from 'fs/promises';
import path from 'path';
import os from 'os';

import * as tc from '@actions/tool-cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec'
import { Octokit } from '@octokit/rest';
import yaml from 'yaml';

import { Actions, Manager, Parameters } from '../../interfaces';
import { BaseManager } from '../base';
import { Executable, InstallResult } from './interfaces';

export class InstallManager extends BaseManager implements Manager {
  private binPath = '';

  public get action(): Actions {
    return Actions.install;
  }

  public async run(params: Parameters): Promise<InstallResult> {
    if (!params.version) {
      throw new Error('version parameter is required');
    }

    this.binPath = path.join(
      tc.find('argocd', params.version),
      'argocd',
    );
    core.info(`argo bin path: ${this.binPath}`);

    try {
      await access(this.binPath);
      // core.addPath(this.binPath);
      core.debug(`Found "argocd" executable at: ${this.binPath}`);
    } catch (e) {
      core.debug('Unable to find "argocd" executable, downloading it now');
      await this.download(params.version);
    }

    return this.getVersion();
  }

  private async getVersion(): Promise<InstallResult> {
    let version = '';

    await exec.exec(
      this.binPath,
      [
        'version',
        '--client'
      ],
      {
        listeners: {
          stdout: (buffer: Buffer) => {
            version += buffer.toString();
          },
        },
      }
    );

    return {
      version: yaml.parse(
        version.replace(/^\s+/gm, ''),
      ),
    };
  }

  private async getExecutableUrl(version: string): Promise<string> {
    const octokit = new Octokit({});
    const executable = Executable[process.platform];

    try {
      const releases = await octokit.repos.getReleaseByTag({
        owner: 'argoproj',
        repo: 'argo-cd',
        tag: `v${version}`,
      });

      const [ asset ] = releases
        .data
        .assets
        .filter((rel) => rel.name === executable);

      return asset.browser_download_url;
    } catch (err) {
      core.setFailed(`Action failed with error ${err}`);

      return '';
    }
  }

  private async download(version: string): Promise<void> {
    const url = await this.getExecutableUrl(version);
    core.debug(`[debug()] getExecutableUrl: ${url}`);

    const exe = process.platform === 'win32' ? 'argocd.exe' : 'argocd';
    const asset = path.join(os.homedir(), exe);
    const assetPath = await tc.downloadTool(url, asset);

    const cachedPath = await tc.cacheFile(assetPath, exe, 'argocd', version);
    core.addPath(cachedPath);

    this.binPath = path.join(cachedPath, exe);
    await chmod(this.binPath, 0o755);
  }
}
