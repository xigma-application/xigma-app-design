// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorWidthOffsetsAtChainPosition } from '../getVectorWidthOffsetsAtChainPosition';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000',
  strokeWidth: 8,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('getVectorWidthOffsetsAtChainPosition', () => {
  it('should return the base half-stroke-width everywhere when there are no explicit width points', () => {
    // mock
    const node = buildNode({ widthProfile: null });

    // result
    expect(getVectorWidthOffsetsAtChainPosition(node, 0.5)).toEqual({ leftOffset: 4, rightOffset: 4 });
  });

  it('should interpolate linearly between the start boundary and an explicit point', () => {
    // mock — one explicit point at fraction 0.5 of the whole chain
    const node = buildNode({
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 20, position: 0.5, rightOffset: 12 } } },
    });

    // before — fraction 0.25 is halfway between the position-0 boundary (base 4) and the position-0.5 point
    const offsets = getVectorWidthOffsetsAtChainPosition(node, 0.25);

    // result
    expect(offsets).toEqual({ leftOffset: 12, rightOffset: 8 });
  });

  it('should return the explicit point value exactly at its own fraction', () => {
    // mock
    const node = buildNode({
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 20, position: 0.5, rightOffset: 12 } } },
    });

    // before
    const offsets = getVectorWidthOffsetsAtChainPosition(node, 0.5);

    // result
    expect(offsets).toEqual({ leftOffset: 20, rightOffset: 12 });
  });

  it('should interpolate down toward the end boundary past the last explicit point', () => {
    // mock
    const node = buildNode({
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 20, position: 0.5, rightOffset: 20 } } },
    });

    // before — fraction 0.75 is halfway between the position-0.5 point and the position-1 end boundary (base 4)
    const offsets = getVectorWidthOffsetsAtChainPosition(node, 0.75);

    // result
    expect(offsets).toEqual({ leftOffset: 12, rightOffset: 12 });
  });

  it('should fall back to the lower breakpoint without dividing by zero when two breakpoints share a position', () => {
    // mock — an explicit point placed exactly at the chain's start boundary
    const node = buildNode({
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 30, position: 0, rightOffset: 30 } } },
    });

    // before
    const offsets = getVectorWidthOffsetsAtChainPosition(node, 0);

    // result
    expect(offsets).toEqual({ leftOffset: 4, rightOffset: 4 });
  });
});
