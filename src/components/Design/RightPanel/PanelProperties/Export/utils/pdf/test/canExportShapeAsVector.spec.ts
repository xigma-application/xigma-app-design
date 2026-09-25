// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

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

  it('should route an ellipse/polygon/star through the simple-shape eligibility check', () => {
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
});
