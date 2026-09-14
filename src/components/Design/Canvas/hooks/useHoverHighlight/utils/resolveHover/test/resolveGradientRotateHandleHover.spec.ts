// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveGradientRotateHandleHover } from '../resolveGradientRotateHandleHover';

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

describe('resolveGradientRotateHandleHover', () => {
  it('should set the hovered endpoint and pointer position when hovering the start handle', () => {
    // mock
    const refs = createCanvasRefs();

    // before — 8px from the endpoint, past the 6px inner move zone, within the 10px outer ring
    resolveGradientRotateHandleHover({ x: 8, y: 50 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientRotateEndpointRef.current).toEqual({ endpoint: 'start', pointerPosition: { x: 8, y: 50 } });
  });

  it('should set the hovered endpoint when hovering the end handle', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientRotateHandleHover({ x: 92, y: 50 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientRotateEndpointRef.current?.endpoint).toBe('end');
  });

  it('should clear the ref when the point is too far from either endpoint', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientRotateHandleHover({ x: 50, y: 50 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientRotateEndpointRef.current).toBeNull();
  });

  it('should clear the ref when there is no active gradient editor', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientRotateHandleHover({ x: 0, y: 50 }, [rectangle], IDENTITY_VIEWPORT, null, refs);

    // result
    expect(refs.hover.hoveredGradientRotateEndpointRef.current).toBeNull();
  });
});
