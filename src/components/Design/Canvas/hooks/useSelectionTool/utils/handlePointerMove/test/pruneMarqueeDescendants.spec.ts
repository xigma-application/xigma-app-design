// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { pruneMarqueeDescendants } from '../pruneMarqueeDescendants';

const rect = (id: string, parentId: string | null = null): TSceneNode =>
  ({
    fill: '#000',
    height: 10,
    id,
    name: 'Rectangle',
    parentId,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const frame = (id: string, childIds: string[], parentId: string | null = null): TSceneNode =>
  ({
    childIds,
    clipContent: true,
    fill: '#fff',
    height: 100,
    id,
    name: 'Frame',
    parentId,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
  }) as TSceneNode;

describe('pruneMarqueeDescendants', () => {
  it('should keep the collided children when their parent frame was not itself collided', () => {
    const frameNode = frame('frame', ['a', 'b']);
    const a = rect('a', 'frame');
    const nodesById = { a, b: rect('b', 'frame'), frame: frameNode };

    // only the child collided (the frame was not fully enclosed)
    expect(pruneMarqueeDescendants([a], nodesById).map((node) => node.id)).toEqual(['a']);
  });

  it('should drop the children and keep the frame when the frame was fully enclosed and collided too', () => {
    const frameNode = frame('frame', ['a', 'b']);
    const a = rect('a', 'frame');
    const b = rect('b', 'frame');
    const nodesById = { a, b, frame: frameNode };

    expect(pruneMarqueeDescendants([frameNode, a, b], nodesById).map((node) => node.id)).toEqual(['frame']);
  });

  it('should keep only the outermost frame for a fully-enclosed nest of frames', () => {
    const outer = frame('outer', ['inner']);
    const inner = frame('inner', ['leaf'], 'outer');
    const leaf = rect('leaf', 'inner');
    const nodesById = { inner, leaf, outer };

    expect(pruneMarqueeDescendants([outer, inner, leaf], nodesById).map((node) => node.id)).toEqual(['outer']);
  });

  it('should leave a plain multi-node selection untouched', () => {
    const a = rect('a');
    const b = rect('b');

    expect(pruneMarqueeDescendants([a, b], { a, b }).map((node) => node.id)).toEqual(['a', 'b']);
  });

  it('should not prune the children of a frame nested directly inside another frame, since it is not click-through itself', () => {
    // inner's own parent is a frame, so inner is not a click-through frame and does not force full
    // enclosure on its own children the way a click-through frame would
    const outer = frame('outer', ['inner']);
    const inner = frame('inner', ['leaf'], 'outer');
    const leaf = rect('leaf', 'inner');
    const nodesById = { inner, leaf, outer };

    expect(pruneMarqueeDescendants([inner, leaf], nodesById).map((node) => node.id)).toEqual(['inner', 'leaf']);
  });
});
