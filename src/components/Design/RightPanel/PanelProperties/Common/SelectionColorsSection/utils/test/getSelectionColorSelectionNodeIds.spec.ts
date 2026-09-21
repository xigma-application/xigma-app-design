// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';
import { TSelectionColorOccurrence } from '../../types';

// utils
import { getSelectionColorSelectionNodeIds } from '../getSelectionColorSelectionNodeIds';

const frame = (id: string, childIds: string[], parentId: string | null = null): TFrameNode => ({
  childIds,
  clipContent: true,
  fills: [],
  height: 10,
  id,
  name: 'Frame',
  parentId,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

const rectangle = (id: string, parentId: string | null): TRectangleNode => ({
  fills: [],
  height: 10,
  id,
  name: 'Rectangle',
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const occurrence = (nodeId: string): TSelectionColorOccurrence => ({ index: 0, nodeId, property: 'fills' });

describe('getSelectionColorSelectionNodeIds', () => {
  it('should keep the main frame over its own matching child, since the parent takes priority', () => {
    // mock
    const child = rectangle('child', 'frame');
    const nodesById: Record<string, TSceneNode> = { child, frame: frame('frame', ['child']) };

    // result
    expect(getSelectionColorSelectionNodeIds([occurrence('frame'), occurrence('child')], nodesById)).toEqual(['frame']);
  });

  it('should keep two unrelated nodes that share no ancestry', () => {
    // mock
    const a = rectangle('a', null);
    const b = rectangle('b', null);
    const nodesById: Record<string, TSceneNode> = { a, b };

    // result
    expect(getSelectionColorSelectionNodeIds([occurrence('a'), occurrence('b')], nodesById)).toEqual(['a', 'b']);
  });

  it('should only keep the topmost match across several nested levels', () => {
    // mock
    const outer = frame('outer', ['inner']);
    const inner = frame('inner', ['leaf'], 'outer');
    const leaf = rectangle('leaf', 'inner');
    const nodesById: Record<string, TSceneNode> = { inner, leaf, outer };

    // result
    expect(getSelectionColorSelectionNodeIds([occurrence('outer'), occurrence('inner'), occurrence('leaf')], nodesById)).toEqual(['outer']);
  });

  it('should deduplicate a node occurring through both a fill and a stroke', () => {
    // mock
    const node = rectangle('a', null);
    const nodesById: Record<string, TSceneNode> = { a: node };
    const occurrences: TSelectionColorOccurrence[] = [
      { index: 0, nodeId: 'a', property: 'fills' },
      { index: 0, nodeId: 'a', property: 'strokes' },
    ];

    // result
    expect(getSelectionColorSelectionNodeIds(occurrences, nodesById)).toEqual(['a']);
  });

  it('should keep a node whose parentId points at a node no longer in the tree', () => {
    // mock
    const orphan = rectangle('orphan', 'missing-parent');
    const nodesById: Record<string, TSceneNode> = { orphan };

    // result
    expect(getSelectionColorSelectionNodeIds([occurrence('orphan')], nodesById)).toEqual(['orphan']);
  });

  it('should keep an unrelated node alongside a parent that also wins its own chain', () => {
    // mock
    const child = rectangle('child', 'frame');
    const sibling = rectangle('sibling', null);
    const nodesById: Record<string, TSceneNode> = { child, frame: frame('frame', ['child']), sibling };

    // result
    expect(getSelectionColorSelectionNodeIds([occurrence('frame'), occurrence('child'), occurrence('sibling')], nodesById)).toEqual([
      'frame',
      'sibling',
    ]);
  });
});
