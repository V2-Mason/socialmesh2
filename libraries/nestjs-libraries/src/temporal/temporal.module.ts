import { DynamicModule, Global, Module } from '@nestjs/common';
import { TemporalModule, TemporalService } from 'nestjs-temporal-core';
import { socialIntegrationList } from '@gitroom/nestjs-libraries/integrations/integration.manager';

export const isTemporalDisabled = () =>
  process.env.TEMPORAL_DISABLED === 'true';

/**
 * Mock client that no-ops all Temporal calls when Temporal is disabled.
 */
const mockRawClient = {
  workflow: {
    list: () => ({
      [Symbol.asyncIterator]: () => ({
        next: async () => ({ done: true, value: undefined }),
      }),
    }),
    start: async () => ({}),
    signalWithStart: async () => ({}),
  },
};

const mockClient = {
  getRawClient: () => mockRawClient,
  getWorkflowHandle: async () => ({
    describe: async () => ({ status: { name: 'TERMINATED' } }),
    terminate: async () => {},
  }),
  terminateWorkflow: async () => {},
};

@Global()
@Module({})
export class TemporalDisabledModule {
  static register(): DynamicModule {
    return {
      module: TemporalDisabledModule,
      global: true,
      providers: [
        {
          provide: TemporalService,
          useValue: { client: mockClient },
        },
      ],
      exports: [TemporalService],
    };
  }
}

export const getTemporalModule = (
  isWorkers: boolean,
  path?: string,
  activityClasses?: any[]
) => {
  if (isTemporalDisabled()) {
    return TemporalDisabledModule.register();
  }

  return TemporalModule.register({
    isGlobal: true,
    connection: {
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
      ...process.env.TEMPORAL_TLS === 'true' ? {tls: true} : {},
      ...process.env.TEMPORAL_API_KEY ? {apiKey: process.env.TEMPORAL_API_KEY} : {},
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    },
    taskQueue: 'main',
    logLevel: 'error',
    ...(isWorkers
      ? {
          workers: [
            { identifier: 'main', maxConcurrentJob: undefined },
            ...socialIntegrationList,
          ]
            .filter((f) => f.identifier.indexOf('-') === -1)
            .map((integration) => ({
              taskQueue: integration.identifier.split('-')[0],
              workflowsPath: path!,
              activityClasses: activityClasses!,
              autoStart: true,
              ...(integration.maxConcurrentJob
                ? {
                    workerOptions: {
                      maxConcurrentActivityTaskExecutions:
                        integration.maxConcurrentJob,
                    },
                  }
                : {}),
            })),
        }
      : {}),
  });
};
