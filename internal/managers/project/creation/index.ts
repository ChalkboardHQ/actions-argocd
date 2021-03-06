import https from 'https';

import axios from 'axios';

import { Actions, Manager, Parameters } from '../../../interfaces';
import { BaseManager } from '../../base';

import { ProjectCreationResult } from './interfaces';

export class ProjectCreationManager extends BaseManager implements Manager {
  public get action(): Actions {
    return Actions.projectCreate;
  }

  public async run(params: Parameters): Promise<ProjectCreationResult> {
    if (!params.name) {
      throw new Error('name parameter is required');
    }

    if (!params.token) {
      throw new Error('token parameter is required');
    }

    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.post(
      `https://${params.ip}:${params.port}/api/v1/projects`,
      {
        project: {
          metadata: {
            name: params.name
          },
          spec: {
            // description: "test1"
          },
        },
        upsert: params.upsert,
      },
      {
        headers: {
          Authorization: `Bearer ${params.token}`,
        },
        httpsAgent: agent,
      }
    );

    if (res.status !== 200) {
      throw new Error('Invalid request');
    }

    console.log(res)

    return {
      name: res.data.metadata.name,
    };
  }
}
