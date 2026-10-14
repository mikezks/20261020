import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

// Naming convention: domain:<owner>-api-<consumer>.
function domainApiTag({ from, to }: { from: string; to: string }): boolean {
  if (!from.startsWith('domain:') || !to.startsWith('domain:')) {
    return false;
  }
  const [fromOwner] = from.slice('domain:'.length).split('-api-');
  const [toOwner, toConsumer] = to.slice('domain:'.length).split('-api-');
  return !!fromOwner && (fromOwner === toOwner || fromOwner === toConsumer);
}

export const config: SheriffConfig = {
  entryFile: 'apps/shell/src/main.ts',
  enableBarrelLess: true,
  autoTagging: false,
  modules: {
    apps: {
      '<domain>': ['domain:<domain>', 'type:app']
    },
    libs: {
      domain: {
        '<domain>': {
          src: ['domain:<domain>', 'type:lib'],
          'src/lib': {
            'api-<consumer>': ['domain:<domain>-api-<consumer>', 'type:api'],
            '<layer>': ({ layer }) => ['domain:<domain>', `type:${layer.split('-')[0]}`]
          }
        }
      },
      shared: {
        '<library>': {
          src: ['domain:shared', 'type:lib'],
          'src/lib/<layer>': ({ layer }) => ['domain:shared', `type:${layer.split('-')[0]}`]
        }
      }
    }
  },
  depRules: {
    'domain:*': [sameTag, domainApiTag, 'domain:shared'],
    'domain:shell': ['domain:*'],
    'type:*': ['type:lib'],
    'type:lib': ['type:api', 'type:route', 'type:feature', 'type:ui', 'type:logic', 'type:util', 'type:model'],
    'type:route': ['type:feature', 'type:logic'],
    'type:api': ['type:ui', 'type:logic', 'type:util', 'type:model'],
    'type:feature': ['type:api', 'type:ui', 'type:logic', 'type:util', 'type:model'],
    'type:ui': ['type:logic', 'type:util', 'type:model'],
    'type:logic': ['type:util', 'type:model'],
    'type:util': ['type:model']
  }
};
