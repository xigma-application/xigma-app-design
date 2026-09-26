// types
import { EffectType, NodeType } from 'types/design/enums';
import { TEffect, TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { canExportVectorNodeAsVector } from '../canExportVectorNodeAsVector';

const groupFilledFacesForRenderingMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/groupFilledFacesForRendering', () => ({
  groupFilledFacesForRendering: (...args: unknown[]): unknown => groupFilledFacesForRenderingMock(...args),
}));

const solidGroup = { paint: [{ color: '#ff0000', opacity: 100, type: 'solid' }], polygons: [] };
const imageGroup = { paint: [{ opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill', type: 'image' }], polygons: [] };
const gradientGroup = {
  paint: [
    {
      end: { x: 10, y: 10 },
      opacity: 100,
      start: { x: 0, y: 0 },
      stops: [
        { color: '#ff0000', opacity: 100, position: 0 },
        { color: '#0000ff', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    },
  ],
  polygons: [],
};

const vectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'v',
  name: 'v',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeWidth: 0,
  strokes: [],
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 20, y: 20 } },
  ...overrides,
});

describe('canExportVectorNodeAsVector', () => {
  beforeEach(() => {
    groupFilledFacesForRenderingMock.mockReset();
    groupFilledFacesForRenderingMock.mockReturnValue([solidGroup]);
  });

  it('should allow a plain filled vector node with no stroke', () => {
    expect(canExportVectorNodeAsVector(vectorNode(), {})).toBe(true);
  });

  it('should reject a vector with a visible effect and allow one whose effects are hidden', () => {
    // mock
    groupFilledFacesForRenderingMock.mockReturnValue([solidGroup]);

    const effect = { type: EffectType.dropShadow } as TEffect;

    // result
    expect(canExportVectorNodeAsVector(vectorNode({ effects: [effect] }), {})).toBe(false);
    expect(canExportVectorNodeAsVector(vectorNode({ effects: [{ ...effect, visible: false }] }), {})).toBe(true);
  });

  it('should reject a hidden node', () => {
    expect(canExportVectorNodeAsVector(vectorNode({ hidden: true }), {})).toBe(false);
  });

  it('should reject a node with any non-solid fill group', () => {
    groupFilledFacesForRenderingMock.mockReturnValue([solidGroup, imageGroup]);
    expect(canExportVectorNodeAsVector(vectorNode(), {})).toBe(false);
  });

  it('should allow a visible uniform stroke without a width profile', () => {
    expect(
      canExportVectorNodeAsVector(vectorNode({ strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }), {}),
    ).toBe(true);
  });

  it('should reject a visible stroke that has a variable width profile', () => {
    expect(
      canExportVectorNodeAsVector(
        vectorNode({ strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }], widthProfile: { points: {} } }),
        {},
      ),
    ).toBe(false);
  });

  it('should allow a width profile when the stroke itself is not visible', () => {
    expect(canExportVectorNodeAsVector(vectorNode({ strokeWidth: 0, widthProfile: { points: {} } }), {})).toBe(true);
  });

  it('should allow a gradient fill group regardless of stop opacity', () => {
    groupFilledFacesForRenderingMock.mockReturnValue([gradientGroup]);
    expect(canExportVectorNodeAsVector(vectorNode(), {})).toBe(true);

    groupFilledFacesForRenderingMock.mockReturnValue([
      { ...gradientGroup, paint: [{ ...gradientGroup.paint[0], stops: [{ color: '#ff0000', opacity: 50, position: 0 }] }] },
    ]);
    expect(canExportVectorNodeAsVector(vectorNode(), {})).toBe(true);
  });

  it('should reject a node whose ancestor is unsafe', () => {
    const parent: TFrameNode = {
      childIds: ['v'],
      clipContent: true,
      fills: [],
      height: 5,
      id: 'p',
      name: 'p',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 5,
      x: 0,
      y: 0,
    };

    expect(canExportVectorNodeAsVector(vectorNode({ parentId: 'p' }), { p: parent })).toBe(false);
  });
});
