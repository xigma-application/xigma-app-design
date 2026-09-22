// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { canExportVectorNodeAsSvgVector } from '../canExportVectorNodeAsSvgVector';

const groupFilledFacesForRenderingMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/groupFilledFacesForRendering', () => ({
  groupFilledFacesForRendering: (...args: unknown[]): unknown => groupFilledFacesForRenderingMock(...args),
}));

const solidGroup = { paint: [{ color: '#ff0000', opacity: 100, type: 'solid' }], polygons: [] };
const imageGroup = { paint: [{ opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill', type: 'image' }], polygons: [] };
const linearGradientGroup = {
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
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 20, y: 20 } },
  ...overrides,
});

describe('canExportVectorNodeAsSvgVector', () => {
  beforeEach(() => {
    groupFilledFacesForRenderingMock.mockReset();
    groupFilledFacesForRenderingMock.mockReturnValue([solidGroup]);
  });

  it('should allow a plain filled vector node with no stroke', () => {
    expect(canExportVectorNodeAsSvgVector(vectorNode(), {})).toBe(true);
  });

  it('should reject a hidden node', () => {
    expect(canExportVectorNodeAsSvgVector(vectorNode({ hidden: true }), {})).toBe(false);
  });

  it('should reject a node with any unsupported fill group', () => {
    groupFilledFacesForRenderingMock.mockReturnValue([solidGroup, imageGroup]);
    expect(canExportVectorNodeAsSvgVector(vectorNode(), {})).toBe(false);
  });

  it('should allow a visible uniform stroke without a width profile', () => {
    expect(canExportVectorNodeAsSvgVector(vectorNode({ strokeColor: '#000000', strokeWidth: 2 }), {})).toBe(true);
  });

  it('should reject a visible stroke that has a variable width profile', () => {
    expect(canExportVectorNodeAsSvgVector(vectorNode({ strokeColor: '#000000', strokeWidth: 2, widthProfile: { points: {} } }), {})).toBe(
      false,
    );
  });

  it('should allow a width profile when the stroke itself is not visible', () => {
    expect(canExportVectorNodeAsSvgVector(vectorNode({ strokeWidth: 0, widthProfile: { points: {} } }), {})).toBe(true);
  });

  it('should allow a linear/radial gradient fill group regardless of stop opacity', () => {
    groupFilledFacesForRenderingMock.mockReturnValue([linearGradientGroup]);
    expect(canExportVectorNodeAsSvgVector(vectorNode(), {})).toBe(true);

    groupFilledFacesForRenderingMock.mockReturnValue([
      { ...linearGradientGroup, paint: [{ ...linearGradientGroup.paint[0], stops: [{ color: '#ff0000', opacity: 50, position: 0 }] }] },
    ]);
    expect(canExportVectorNodeAsSvgVector(vectorNode(), {})).toBe(true);
  });

  it('should allow an angular/diamond gradient fill group (approximated as vector sectors/rings)', () => {
    groupFilledFacesForRenderingMock.mockReturnValue([
      { ...linearGradientGroup, paint: [{ ...linearGradientGroup.paint[0], type: 'gradient-angular' }] },
    ]);
    expect(canExportVectorNodeAsSvgVector(vectorNode(), {})).toBe(true);
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

    expect(canExportVectorNodeAsSvgVector(vectorNode({ parentId: 'p' }), { p: parent })).toBe(false);
  });
});
