// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { hasFrameStrokeOverChildren } from '../hasFrameStrokeOverChildren';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['child-a'],
  clipContent: false,
  fills: [],
  height: 40,
  id: 'frame-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 40,
  x: 0,
  y: 0,
  ...overrides,
});

describe('hasFrameStrokeOverChildren', () => {
  it('should be true for a frame with children and a stroke paint', () => {
    expect(hasFrameStrokeOverChildren(buildFrame({ strokeWidth: 2, strokes: [{ color: '#000', opacity: 100, type: 'solid' }] }))).toBe(
      true,
    );
  });

  it('should be true for a frame with children and a legacy stroke color', () => {
    expect(hasFrameStrokeOverChildren(buildFrame({ strokeColor: '#000', strokeWidth: 2 }))).toBe(true);
  });

  it('should be false for a frame without children', () => {
    expect(hasFrameStrokeOverChildren(buildFrame({ childIds: [], strokeColor: '#000', strokeWidth: 2 }))).toBe(false);
  });

  it('should be false for a frame without a stroke', () => {
    expect(hasFrameStrokeOverChildren(buildFrame())).toBe(false);
  });

  it('should be false for a non-frame node', () => {
    const rectangle = {
      fills: [],
      height: 1,
      id: 'r',
      name: 'r',
      parentId: null,
      rotation: 0,
      strokeColor: '#000',
      strokeWidth: 2,
      type: NodeType.rectangle,
      width: 1,
      x: 0,
      y: 0,
    } as TRectangleNode;

    expect(hasFrameStrokeOverChildren(rectangle)).toBe(false);
  });
});
