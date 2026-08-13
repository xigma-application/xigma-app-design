// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPolygonNode, TSceneNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { getNodeAtPoint } from '../getNodeAtPoint';

const buildNode = (overrides: Partial<Exclude<TBoxSceneNode, TPolygonNode | TStarNode | TMediaNode | TTextNode>>): TSceneNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'node',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getNodeAtPoint', () => {
  it('should return the node the point falls inside', () => {
    // mock
    const node = buildNode({ id: 'a' });

    // result
    expect(getNodeAtPoint({ x: 5, y: 5 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should return null when the point misses every node', () => {
    // mock
    const node = buildNode({ id: 'a' });

    // result
    expect(getNodeAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return the topmost (last-drawn) node when nodes overlap', () => {
    // mock
    const bottom = buildNode({ id: 'bottom' });
    const top = buildNode({ id: 'top' });

    // result
    expect(getNodeAtPoint({ x: 5, y: 5 }, [bottom, top], IDENTITY_VIEWPORT)?.id).toBe('top');
  });

  it('should treat the edges of a node as inside', () => {
    // mock
    const node = buildNode({ height: 10, id: 'a', width: 10, x: 0, y: 0 });

    // result
    expect(getNodeAtPoint({ x: 10, y: 10 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should return null for an empty scene', () => {
    // result
    expect(getNodeAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should use elliptical hit-testing for ellipse nodes, not the bounding box', () => {
    // mock
    const node = buildNode({ height: 10, type: NodeType.ellipse, width: 20, x: 0, y: 0 });

    // result — the bounding box's (0, 0) corner sits outside the inscribed ellipse
    expect(getNodeAtPoint({ x: 0, y: 0 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 10, y: 5 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should use polygonal hit-testing for polygon nodes, not the bounding box', () => {
    // mock
    const node: TSceneNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 10,
      id: 'a',
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides: 4,
      type: NodeType.polygon,
      width: 10,
      x: 0,
      y: 0,
    };

    // result — the bounding box's (0, 0) corner sits outside the diamond inscribed in it
    expect(getNodeAtPoint({ x: 0, y: 0 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 5, y: 5 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should use star-shaped hit-testing for star nodes, not the bounding box', () => {
    // mock
    const node: TSceneNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 100,
      id: 'a',
      name: 'Star',
      parentId: null,
      points: 5,
      ratio: 0.382,
      rotation: 0,
      type: NodeType.star,
      width: 100,
      x: 0,
      y: 0,
    };

    // result — this point sits in a concave notch, beyond the inner radius reached there
    expect(getNodeAtPoint({ x: 73.51, y: 17.64 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should use distance-from-segment hit-testing for line nodes, not the bounding box', () => {
    // mock
    const line: TSceneNode = {
      id: 'a',
      name: 'Line',
      parentId: null,
      stroke: '#000000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 10,
    };

    // result — (0, 10) sits inside the diagonal's bounding box but far from the diagonal itself
    expect(getNodeAtPoint({ x: 0, y: 10 }, [line], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 5, y: 5 }, [line], IDENTITY_VIEWPORT)).toEqual(line);
  });

  it('should use per-line text hit-testing for text nodes, not the full fixed box', () => {
    // mock
    const node: TSceneNode = {
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: 500,
      id: 'a',
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: 500,
      x: 0,
      y: 0,
    };

    // result — the box is 500x500 but "Hi" only occupies a small area near the top-left
    expect(getNodeAtPoint({ x: 300, y: 300 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 2, y: 2 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should hit-test against the rotated shape, not the unrotated bounding box', () => {
    // mock
    const node = buildNode({ height: 10, rotation: 90, width: 20, x: 0, y: 0 });

    // result — (10, -3) sits inside the box once rotated 90deg around its center (10, 5), even
    expect(getNodeAtPoint({ x: 10, y: -3 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
    expect(getNodeAtPoint({ x: 19, y: 9 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should widen the line hit-test tolerance in world units as the viewport zooms out', () => {
    // mock
    const line: TSceneNode = { id: 'a', name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 };

    // result — 6 world units off the segment misses at zoom 1 (4px tolerance) but hits at zoom
    expect(getNodeAtPoint({ x: 5, y: 6 }, [line], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 5, y: 6 }, [line], { x: 0, y: 0, zoom: 0.5 })).toEqual(line);
  });
});
