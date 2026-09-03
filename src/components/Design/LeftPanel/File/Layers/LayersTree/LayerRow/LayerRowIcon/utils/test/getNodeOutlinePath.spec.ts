// types
import { NodeType, PathType } from 'types/design/enums';
import {
  TEllipseNode,
  TFrameNode,
  TLineNode,
  TMediaNode,
  TPathNode,
  TPolygonNode,
  TRectangleNode,
  TSectionNode,
  TStarNode,
  TTextNode,
  TVectorNode,
} from 'types/design/types';

// utils
import { getNodeOutlinePath } from '../getNodeOutlinePath';

describe('getNodeOutlinePath', () => {
  it('should return an outline for a rectangle node', () => {
    // mock
    const node: TRectangleNode = {
      fill: '#ff0000',
      height: 40,
      id: 'rect-1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 40,
      x: 0,
      y: 0,
    };

    // action
    const result = getNodeOutlinePath(node);

    // result
    expect(result?.d).toMatch(/^M/);
  });

  it('should return an outline for an ellipse node', () => {
    // mock
    const node: TEllipseNode = {
      fill: '#ff0000',
      height: 40,
      id: 'ellipse-1',
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 40,
      x: 0,
      y: 0,
    };

    // action
    const result = getNodeOutlinePath(node);

    // result
    expect(result?.d).toMatch(/^M/);
  });

  it('should return an outline for a polygon node', () => {
    // mock
    const node: TPolygonNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 40,
      id: 'polygon-1',
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides: 5,
      type: NodeType.polygon,
      width: 40,
      x: 0,
      y: 0,
    };

    // action
    const result = getNodeOutlinePath(node);

    // result
    expect(result?.d).toMatch(/^M/);
  });

  it('should return an outline for a star node', () => {
    // mock
    const node: TStarNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 40,
      id: 'star-1',
      name: 'Star',
      parentId: null,
      points: 5,
      ratio: 0.5,
      rotation: 0,
      type: NodeType.star,
      width: 40,
      x: 0,
      y: 0,
    };

    // action
    const result = getNodeOutlinePath(node);

    // result
    expect(result?.d).toMatch(/^M/);
  });

  it('should return an outline for a line node', () => {
    // mock
    const node: TLineNode = {
      id: 'line-1',
      name: 'Line',
      parentId: null,
      stroke: '#000000',
      type: NodeType.line,
      x1: 0,
      x2: 40,
      y1: 0,
      y2: 40,
    };

    // action
    const result = getNodeOutlinePath(node);

    // result
    expect(result?.d).toMatch(/^M/);
  });

  it('should return an outline built directly from a vector node’s own vertices/segments', () => {
    // mock
    const node: TVectorNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'vector-1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 2,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 40, y: 40 } },
    };

    // action
    const result = getNodeOutlinePath(node);

    // result
    expect(result?.d).toBe('M2 2 L14 14');
  });

  it('should return null for a text-on-path guide node — a path node is never shown as a layer row', () => {
    // mock
    const node: TPathNode = {
      height: 40,
      id: 'path-1',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 40,
      x: 0,
      y: 0,
    };

    // action
    const result = getNodeOutlinePath(node);

    // result
    expect(result).toBeNull();
  });

  it('should return null for a frame node', () => {
    // mock
    const node: TFrameNode = {
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 40,
      id: 'frame-1',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 40,
      x: 0,
      y: 0,
    };

    // action & result
    expect(getNodeOutlinePath(node)).toBeNull();
  });

  it('should return null for a section node', () => {
    // mock
    const node: TSectionNode = {
      childIds: [],
      fill: '#ff0000',
      height: 40,
      id: 'section-1',
      name: 'Section',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: 40,
      x: 0,
      y: 0,
    };

    // action & result
    expect(getNodeOutlinePath(node)).toBeNull();
  });

  it('should return null for a text node', () => {
    // mock
    const node: TTextNode = {
      content: 'Hello',
      fill: '#000000',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 16,
      height: 20,
      id: 'text-1',
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: 100,
      x: 0,
      y: 0,
    };

    // action & result
    expect(getNodeOutlinePath(node)).toBeNull();
  });

  it('should return null for a media node', () => {
    // mock
    const node: TMediaNode = {
      flipX: false,
      flipY: false,
      height: 40,
      id: 'media-1',
      name: 'Image',
      parentId: null,
      rotation: 0,
      src: 'image.png',
      type: NodeType.media,
      width: 40,
      x: 0,
      y: 0,
    };

    // action & result
    expect(getNodeOutlinePath(node)).toBeNull();
  });
});
