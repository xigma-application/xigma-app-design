// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveGradientStopHandleHover } from '../resolveGradientStopHandleHover';

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

describe('resolveGradientStopHandleHover', () => {
  it('should set the hovered stop index when the point sits on a stop', () => {
    // mock
    const refs = createCanvasRefs();

    // before — stop 1 world position: (100, 50) offset up by 22 -> (100, 28)
    resolveGradientStopHandleHover({ x: 100, y: 28 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientStopIndexRef.current).toBe(1);
  });

  it('should clear the ref when the point is far from every stop', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientStopHandleHover({ x: 50, y: 28 }, [rectangle], IDENTITY_VIEWPORT, GRADIENT_EDITOR, refs);

    // result
    expect(refs.hover.hoveredGradientStopIndexRef.current).toBeNull();
  });

  it('should clear the ref when there is no active gradient editor', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveGradientStopHandleHover({ x: 0, y: 28 }, [rectangle], IDENTITY_VIEWPORT, null, refs);

    // result
    expect(refs.hover.hoveredGradientStopIndexRef.current).toBeNull();
  });
});
