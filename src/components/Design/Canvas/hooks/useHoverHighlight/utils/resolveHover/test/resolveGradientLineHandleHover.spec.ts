// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveGradientLineHandleHover } from '../resolveGradientLineHandleHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rectangle: TRectangleNode = {
  fills: [
    {
      end: { x: 1, y: 0.5 },
      opacity: 100,
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    },
  ],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

const GRADIENT_EDITOR = { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null };

describe('resolveGradientLineHandleHover', () => {
  it('should set the hovered line position when the point sits on the line', () => {
    // mock
    const refs = createCanvasRefs();

    // before — the line runs world (0,50) -> (100,50)
    resolveGradientLineHandleHover({ x: 50, y: 50 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientLinePositionRef.current).toBeCloseTo(0.5);
  });

  it('should clear the ref when the point is too far from the line', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientLineHandleHover({ x: 50, y: 80 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientLinePositionRef.current).toBeNull();
  });

  it('should clear the ref when there is no active gradient editor', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientLineHandleHover({ x: 50, y: 50 }, [rectangle], IDENTITY_VIEWPORT, null, refs);

    // result
    expect(refs.hover.hoveredGradientLinePositionRef.current).toBeNull();
  });

  it('should clear the ref when the point is over an existing stop instead', () => {
    // mock
    const refs = createCanvasRefs();

    // before — the stop at position 0 sits at world (0, 50), offset up by 22 -> (0, 28)
    resolveGradientLineHandleHover({ x: 0, y: 28 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientLinePositionRef.current).toBeNull();
  });
});
