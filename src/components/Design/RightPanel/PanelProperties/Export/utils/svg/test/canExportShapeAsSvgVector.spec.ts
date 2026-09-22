// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TLineNode, TRectangleNode } from 'types/design/types';

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
  fill: '#ff0000',
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

const line: TLineNode = { id: 'l', name: 'l', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 };

describe('canExportShapeAsSvgVector', () => {
  it('should route a box shape through the box eligibility check', () => {
    expect(canExportShapeAsSvgVector(rectangle, {})).toBe(true);
    expect(canExportShapeAsSvgVector({ ...rectangle, strokeColor: '#000000', strokeWidth: 2 }, {})).toBe(false);
  });

  it('should route a frame through the box eligibility check too', () => {
    expect(canExportShapeAsSvgVector(frame, {})).toBe(true);
    expect(canExportShapeAsSvgVector({ ...frame, hidden: true }, {})).toBe(false);
  });

  it('should route an ellipse/polygon/star through the simple-shape eligibility check', () => {
    expect(canExportShapeAsSvgVector(ellipse, {})).toBe(true);
    expect(canExportShapeAsSvgVector({ ...ellipse, hidden: true }, {})).toBe(false);
  });

  it('should route a line through the line eligibility check', () => {
    expect(canExportShapeAsSvgVector(line, {})).toBe(true);
    expect(canExportShapeAsSvgVector({ ...line, hidden: true }, {})).toBe(false);
  });
});
