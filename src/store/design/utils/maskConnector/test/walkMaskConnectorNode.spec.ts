// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TMaskNode, TRectangleNode, TSceneNode } from 'types/design/types';
import { TMaskConnectorLine } from 'store/design/types';

// utils
import { walkMaskConnectorNode } from '../walkMaskConnectorNode';

const rect = (id: string, overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#fff',
  height: 10,
  id,
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const group = (id: string, childIds: string[]): TGroupNode => ({
  childIds,
  height: 10,
  id,
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
});

const mask = (id: string, childIds: string[]): TMaskNode => ({
  childIds,
  height: 10,
  id,
  name: 'Mask group',
  parentId: null,
  rotation: 0,
  type: NodeType.mask,
  width: 10,
  x: 0,
  y: 0,
});

describe('walkMaskConnectorNode', () => {
  it('should do nothing when the node id does not resolve (dangling reference)', () => {
    const infoById = new Map<string, TMaskConnectorLine[]>();
    walkMaskConnectorNode({}, infoById, 'missing', [{ depthOffset: 0, role: 'masked-start' }]);
    expect(infoById.size).toBe(0);
  });

  it('should attach any passthrough lines to a leaf node and not recurse into it', () => {
    const nodes: Record<string, TSceneNode> = { a: rect('a') };
    const infoById = new Map<string, TMaskConnectorLine[]>();
    walkMaskConnectorNode(nodes, infoById, 'a', [{ depthOffset: 0, role: 'masked-start' }]);
    expect(infoById.get('a')).toEqual([{ depthOffset: 0, role: 'masked-start' }]);
  });

  it('should not attach anything when no line is open and the node has no own mask scope', () => {
    const nodes: Record<string, TSceneNode> = { a: rect('a'), group: group('group', ['a']) };
    const infoById = new Map<string, TMaskConnectorLine[]>();
    walkMaskConnectorNode(nodes, infoById, 'group', []);
    expect(infoById.size).toBe(0);
  });

  it('should never assign mask roles to a plain group’s children, even with several of them', () => {
    const nodes: Record<string, TSceneNode> = {
      a: rect('a', { parentId: 'group' }),
      b: rect('b', { parentId: 'group' }),
      group: group('group', ['a', 'b']),
    };

    const infoById = new Map<string, TMaskConnectorLine[]>();
    walkMaskConnectorNode(nodes, infoById, 'group', []);

    expect(infoById.size).toBe(0);
  });

  it('should assign own scope roles to a mask container’s children — the last child is always the mask', () => {
    const nodes: Record<string, TSceneNode> = {
      a: rect('a', { parentId: 'mask-1' }),
      b: rect('b', { parentId: 'mask-1' }),
      'mask-1': mask('mask-1', ['a', 'b']),
    };

    const infoById = new Map<string, TMaskConnectorLine[]>();
    walkMaskConnectorNode(nodes, infoById, 'mask-1', []);

    expect(infoById.get('a')).toEqual([{ depthOffset: 0, role: 'masked-start' }]);
    expect(infoById.get('b')).toEqual([{ depthOffset: 0, role: 'mask' }]);
  });
});
