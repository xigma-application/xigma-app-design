// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveGradientEndpointMoveHandleHover } from '../resolveGradientEndpointMoveHandleHover';

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

// the line runs world (0,50) -> (100,50): start at (0,50), end at (100,50)

describe('resolveGradientEndpointMoveHandleHover', () => {
  it('should set the hovered endpoint when hovering the start handle', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientEndpointMoveHandleHover({ x: 3, y: 50 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientEndpointMoveRef.current).toBe('start');
  });

  it('should set the hovered endpoint when hovering the end handle', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientEndpointMoveHandleHover({ x: 97, y: 50 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientEndpointMoveRef.current).toBe('end');
  });

  it('should clear the ref when the point is outside the tight move radius', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientEndpointMoveHandleHover({ x: 8, y: 50 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientEndpointMoveRef.current).toBeNull();
  });

  it('should clear the ref when there is no active gradient editor', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientEndpointMoveHandleHover({ x: 0, y: 50 }, [rectangle], IDENTITY_VIEWPORT, null, refs);

    // result
    expect(refs.hover.hoveredGradientEndpointMoveRef.current).toBeNull();
  });
});
