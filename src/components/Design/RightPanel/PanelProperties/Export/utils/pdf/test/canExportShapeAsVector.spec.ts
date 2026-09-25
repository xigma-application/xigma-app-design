// types
import { EffectType, NodeType } from 'types/design/enums';
import { TEffect, TEllipseNode, TFrameNode, TLineNode, TPolygonNode, TRectangleNode, TStarNode, TVectorNode } from 'types/design/types';

// utils
import { canExportShapeAsVector } from '../canExportShapeAsVector';

const rectangle: TRectangleNode = {
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'r',
  name: 'r',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

const ellipse: TEllipseNode = {
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'e',
  name: 'e',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 10,
  x: 0,
  y: 0,
};

const line: TLineNode = {
  height: 0,
  id: 'l',
  name: 'l',
  parentId: null,
  rotation: 0,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 10,
  x: 0,
  y: 0,
};

const vector: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vec',
  name: 'vec',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('canExportShapeAsVector', () => {
  it('should route a box shape through the box eligibility check', () => {
    expect(canExportShapeAsVector(rectangle, {})).toBe(true);
    expect(canExportShapeAsVector({ ...rectangle, strokeColor: '#000000', strokeWidth: 2 }, {})).toBe(false);
  });

  it('should route an ellipse through its own eligibility check', () => {
    expect(canExportShapeAsVector(ellipse, {})).toBe(true);
    expect(canExportShapeAsVector({ ...ellipse, hidden: true }, {})).toBe(false);
  });

  it('should route a line through the line eligibility check', () => {
    expect(canExportShapeAsVector(line, {})).toBe(true);
    expect(canExportShapeAsVector({ ...line, hidden: true }, {})).toBe(false);
  });

  it('should route a pen-tool vector node through the vector-node eligibility check', () => {
    expect(canExportShapeAsVector(vector, {})).toBe(true);
    expect(canExportShapeAsVector({ ...vector, hidden: true }, {})).toBe(false);
  });

  it('should route a polygon through the paint shape eligibility check', () => {
    // mock
    const polygon: TPolygonNode = { ...ellipse, flipX: false, flipY: false, sides: 5, type: NodeType.polygon };

    // result
    expect(canExportShapeAsVector(polygon, {})).toBe(true);
    expect(
      canExportShapeAsVector(
        { ...polygon, effects: [{ blur: 4, color: '#000000', type: EffectType.dropShadow, visible: true } as TEffect] },
        {},
      ),
    ).toBe(false);
  });

  it('should route a star through the simple-shape eligibility check', () => {
    // mock
    const star = {
      ...ellipse,
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      points: 5,
      ratio: 0.5,
      type: NodeType.star,
    } as unknown as TStarNode;

    // result
    expect(canExportShapeAsVector(star, {})).toBe(true);
    expect(canExportShapeAsVector({ ...star, hidden: true }, {})).toBe(false);
  });

  it('should route a frame through the box eligibility check', () => {
    // mock
    const frame = { ...rectangle, childIds: [], clipContent: false, type: NodeType.frame } as TFrameNode;

    // result
    expect(canExportShapeAsVector(frame, {})).toBe(true);
    expect(canExportShapeAsVector({ ...frame, hidden: true }, {})).toBe(false);
  });
});
