// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { canReplaceNodeWithClipboardRoot } from '../canReplaceNodeWithClipboardRoot';

const slice = { id: 'slice', parentId: null, type: NodeType.slice } as TSceneNode;
const rectangle = { id: 'rectangle', parentId: null, type: NodeType.rectangle } as TSceneNode;
const nested = { id: 'nested', parentId: 'frame', type: NodeType.rectangle } as TSceneNode;

describe('canReplaceNodeWithClipboardRoot', () => {
  it('should let a slice replace only a layer on the page', () => {
    // result
    expect(canReplaceNodeWithClipboardRoot(slice, rectangle)).toBe(true);
    expect(canReplaceNodeWithClipboardRoot(slice, nested)).toBe(false);
  });

  it('should let any other layer replace a layer anywhere', () => {
    // result
    expect(canReplaceNodeWithClipboardRoot(rectangle, nested)).toBe(true);
  });
});
