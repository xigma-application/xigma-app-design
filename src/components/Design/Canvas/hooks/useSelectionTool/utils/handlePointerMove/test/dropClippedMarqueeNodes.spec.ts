// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { dropClippedMarqueeNodes } from '../dropClippedMarqueeNodes';

const box = (overrides: Partial<TSceneNode>): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ff0000',
    height: 100,
    id: 'n',
    name: 'Box',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const frame = box({ height: 400, id: 'frame', width: 400 }); // 0..400, clips
// child pokes past the frame's right edge: 380..460
const child = box({ height: 40, id: 'child', parentId: 'frame', type: NodeType.rectangle, width: 80, x: 380, y: 100 });
const nodesById: Record<string, TSceneNode> = { child, frame };

const marquee = (x: number, width: number): TDraftRect => ({ height: 200, width, x, y: 0 });

describe('dropClippedMarqueeNodes', () => {
  it('should keep a node with no clipping ancestor untouched', () => {
    const loose = box({ id: 'loose', parentId: null, type: NodeType.rectangle });

    expect(dropClippedMarqueeNodes([loose], marquee(0, 500), { loose })).toEqual([loose]);
  });

  it('should drop a child the marquee only reaches through its clipped-away part', () => {
    expect(dropClippedMarqueeNodes([child], marquee(420, 100), nodesById)).toEqual([]);
  });

  it('should keep a child the marquee reaches through its still-visible part', () => {
    expect(dropClippedMarqueeNodes([child], marquee(350, 40), nodesById)).toEqual([child]);
  });

  it('should keep a child fully inside the clipping frame', () => {
    const inside = box({ height: 40, id: 'inside', parentId: 'frame', type: NodeType.rectangle, width: 40, x: 100, y: 100 });

    expect(dropClippedMarqueeNodes([inside], marquee(90, 60), { frame, inside })).toEqual([inside]);
  });
});
