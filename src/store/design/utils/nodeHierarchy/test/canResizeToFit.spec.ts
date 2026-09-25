// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { canResizeToFit } from '../canResizeToFit';

const box = { height: 10, rotation: 0, width: 10, x: 0, y: 0 };
const makeSection = (id: string, childIds: string[]): TSectionNode => ({
  ...box,
  childIds,
  fills: [],
  id,
  name: id,
  parentId: null,
  type: NodeType.section,
});
const makeFrame = (id: string, childIds: string[]): TFrameNode => ({
  ...box,
  childIds,
  clipContent: true,
  fills: [],
  id,
  name: id,
  parentId: null,
  type: NodeType.frame,
});
const rectangle: TRectangleNode = { ...box, fills: [], id: 'rectangle', name: 'rectangle', parentId: null, type: NodeType.rectangle };
const nodes: Record<string, TSceneNode> = { rectangle };

describe('canResizeToFit', () => {
  it('should allow a selection where at least one section or frame has children', () => {
    // action / result
    expect(canResizeToFit([makeSection('empty', []), makeSection('full', ['rectangle'])], nodes)).toBe(true);
    expect(canResizeToFit([makeFrame('frame', ['rectangle'])], nodes)).toBe(true);
  });

  it('should not allow a selection of empty containers, missing children or other node types', () => {
    // action / result
    expect(canResizeToFit([], nodes)).toBe(false);
    expect(canResizeToFit([undefined, rectangle], nodes)).toBe(false);
    expect(canResizeToFit([makeSection('empty', []), makeFrame('ghost', ['missing'])], nodes)).toBe(false);
  });
});
