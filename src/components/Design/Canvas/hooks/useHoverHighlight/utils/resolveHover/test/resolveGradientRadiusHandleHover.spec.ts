// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveGradientRadiusHandleHover } from '../resolveGradientRadiusHandleHover';

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
      type: 'gradient-radial',
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

// start (0,50), end (100,50) -> the radius handle sits at world (0, 150)

describe('resolveGradientRadiusHandleHover', () => {
  it('should set the hovered node when hovering the radius handle', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientRadiusHandleHover({ x: 0, y: 150 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientRadiusHandleRef.current).toBe('rect-1');
  });

  it('should clear the ref when the point is outside the handle tolerance', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientRadiusHandleHover({ x: 50, y: 50 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientRadiusHandleRef.current).toBeNull();
  });

  it('should clear the ref when there is no active gradient editor', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientRadiusHandleHover({ x: 0, y: 150 }, [rectangle], IDENTITY_VIEWPORT, null, refs);

    // result
    expect(refs.hover.hoveredGradientRadiusHandleRef.current).toBeNull();
  });
});
