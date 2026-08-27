// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TLineNode, TPolygonNode, TRectangleNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { convertNodeToVector, isConvertibleToVectorNode } from '../convertNodeToVector';

const RECTANGLE: TRectangleNode = {
  fill: '#fff',
  height: 10,
  id: 'r',
  name: 'R',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};
const ELLIPSE: TEllipseNode = {
  fill: '#fff',
  height: 10,
  id: 'e',
  name: 'E',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 10,
  x: 0,
  y: 0,
};
const POLYGON: TPolygonNode = {
  fill: '#fff',
  flipX: false,
  flipY: false,
  height: 10,
  id: 'p',
  name: 'P',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 10,
  x: 0,
  y: 0,
};
const STAR: TStarNode = {
  fill: '#fff',
  flipX: false,
  flipY: false,
  height: 10,
  id: 's',
  name: 'S',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 10,
  x: 0,
  y: 0,
};
const LINE: TLineNode = { id: 'l', name: 'L', parentId: null, stroke: '#000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 10 };
const TEXT: TTextNode = {
  content: 'hi',
  fill: '#000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 12,
  height: 10,
  id: 't',
  name: 'T',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 10,
  x: 0,
  y: 0,
};

describe('isConvertibleToVectorNode', () => {
  it('should accept every shape in the rectangle toolbar group except media', () => {
    // result
    expect(isConvertibleToVectorNode(RECTANGLE)).toBe(true);
    expect(isConvertibleToVectorNode(ELLIPSE)).toBe(true);
    expect(isConvertibleToVectorNode(POLYGON)).toBe(true);
    expect(isConvertibleToVectorNode(STAR)).toBe(true);
    expect(isConvertibleToVectorNode(LINE)).toBe(true);
  });

  it('should reject node types outside that group', () => {
    // result
    expect(isConvertibleToVectorNode(TEXT)).toBe(false);
  });
});

describe('convertNodeToVector', () => {
  it('should dispatch each node type to its dedicated converter', () => {
    // result
    expect(convertNodeToVector(RECTANGLE).type).toBe(NodeType.vector);
    expect(convertNodeToVector(ELLIPSE).type).toBe(NodeType.vector);
    expect(convertNodeToVector(POLYGON).type).toBe(NodeType.vector);
    expect(convertNodeToVector(STAR).type).toBe(NodeType.vector);
    expect(convertNodeToVector(LINE).type).toBe(NodeType.vector);
  });
});
