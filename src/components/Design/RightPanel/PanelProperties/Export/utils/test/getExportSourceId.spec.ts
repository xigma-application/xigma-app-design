// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getExportSourceId } from '../getExportSourceId';

const nodesById = {
  frame: { id: 'frame', type: NodeType.frame },
  slice: { id: 'slice', type: NodeType.slice },
} as unknown as Record<string, TSceneNode>;

describe('getExportSourceId', () => {
  it('should export a slice as the page area', () => {
    // result
    expect(getExportSourceId('slice', nodesById)).toBeNull();
  });

  it('should keep the id of any other layer, a missing layer or the page', () => {
    // result
    expect(getExportSourceId('frame', nodesById)).toBe('frame');
    expect(getExportSourceId('missing', nodesById)).toBe('missing');
    expect(getExportSourceId(null, nodesById)).toBeNull();
  });
});
