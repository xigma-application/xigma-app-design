// types
import { EffectType, NodeType } from 'types/design/enums';
import {
  TEffect,
  TEllipseNode,
  TFrameNode,
  TLineNode,
  TMediaNode,
  TPolygonNode,
  TRectangleNode,
  TStarNode,
  TVectorNode,
} from 'types/design/types';

// utils
import { canExportShapeAsSvgVector } from '../canExportShapeAsSvgVector';

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

const frame: TFrameNode = {
  childIds: [],
  clipContent: false,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'f',
  name: 'f',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
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

const media: TMediaNode = {
  flipX: false,
  flipY: false,
  height: 10,
  id: 'm',
  name: 'm',
  parentId: null,
  rotation: 0,
  src: 's',
  type: NodeType.media,
  width: 10,
  x: 0,
  y: 0,
};

describe('canExportShapeAsSvgVector', () => {
  it('should route a box shape through the box eligibility check', () => {
    expect(canExportShapeAsSvgVector(rectangle, {})).toBe(true);
    expect(canExportShapeAsSvgVector({ ...rectangle, strokeColor: '#000000', strokeWidth: 2 }, {})).toBe(false);
  });

  it('should route a frame through the box eligibility check too', () => {
    expect(canExportShapeAsSvgVector(frame, {})).toBe(true);
    expect(canExportShapeAsSvgVector({ ...frame, hidden: true }, {})).toBe(false);
  });

  it('should route an ellipse through its own eligibility check', () => {
    expect(canExportShapeAsSvgVector(ellipse, {})).toBe(true);
    expect(canExportShapeAsSvgVector({ ...ellipse, hidden: true }, {})).toBe(false);
  });

  it('should route a line through the line eligibility check', () => {
    expect(canExportShapeAsSvgVector(line, {})).toBe(true);
    expect(canExportShapeAsSvgVector({ ...line, hidden: true }, {})).toBe(false);
  });

  it('should route a pen-tool vector node through the vector-node eligibility check', () => {
    expect(canExportShapeAsSvgVector(vector, {})).toBe(true);
    expect(canExportShapeAsSvgVector({ ...vector, hidden: true }, {})).toBe(false);
  });

  it('should route a standalone media node through the media eligibility check', () => {
    expect(canExportShapeAsSvgVector(media, {})).toBe(true);
    expect(canExportShapeAsSvgVector({ ...media, src: '' }, {})).toBe(false);
  });

  it('should route a polygon through the paint shape eligibility check', () => {
    // mock
    const polygon: TPolygonNode = { ...ellipse, flipX: false, flipY: false, sides: 5, type: NodeType.polygon };

    // result
    expect(canExportShapeAsSvgVector(polygon, {})).toBe(true);
    expect(
      canExportShapeAsSvgVector(
        { ...polygon, effects: [{ blur: 4, color: '#000000', type: EffectType.dropShadow, visible: true } as TEffect] },
        {},
      ),
    ).toBe(false);
  });

  it('should route a star through the paint shape eligibility check', () => {
    // mock
    const star: TStarNode = { ...ellipse, flipX: false, flipY: false, points: 5, ratio: 0.5, type: NodeType.star };

    // result
    expect(canExportShapeAsSvgVector(star, {})).toBe(true);
    expect(
      canExportShapeAsSvgVector(
        { ...star, effects: [{ blur: 4, color: '#000000', type: EffectType.dropShadow, visible: true } as TEffect] },
        {},
      ),
    ).toBe(false);
  });
});
