// types
import { TVectorNodeCluster } from '../../getVectorNodeClusters/types';

// utils
import { buildKey } from '../buildKey';

const cluster: TVectorNodeCluster = { key: 'a,b', segmentIds: ['s1'], vertexIds: ['a', 'b'] };

describe('buildKey', () => {
  it('should combine the node id and cluster key when there is no extra key', () => {
    expect(buildKey('node-1', cluster, '')).toBe('node-1:a,b');
  });

  it('should append the extra key, separated by a colon, when one is given', () => {
    expect(buildKey('node-1', cluster, 'loop-a')).toBe('node-1:a,b:loop-a');
  });
});
