// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveEllipseArcHandleHover } from '../resolveEllipseArcHandleHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const ellipse: TEllipseNode = {
  fill: '#ff0000',
  height: 100,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
};

const rectangle: TRectangleNode = {
  fill: '#ff0000',
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

describe('resolveEllipseArcHandleHover', () => {
  it("should mark the ellipse's own id when the point sits precisely on its Sweep handle dot", () => {
    // mock — a 100x100 ellipse at (0,0): the Sweep handle rests at (100, 50), straight right of center
    const refs = createCanvasRefs();

    // before
    resolveEllipseArcHandleHover({ x: 100, y: 50 }, [ellipse], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredEllipseArcHandleRef.current).toBe('ellipse-1');
  });

  it('should clear the ref for a hover elsewhere on the shape — only precisely on the dot counts', () => {
    // mock
    const refs = createCanvasRefs();

    // before — dead center of the ellipse, far from the (100, 50) handle
    resolveEllipseArcHandleHover({ x: 50, y: 50 }, [ellipse], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredEllipseArcHandleRef.current).toBeNull();
  });

  it('should clear the ref when nothing (or something other than a single ellipse) is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveEllipseArcHandleHover({ x: 100, y: 50 }, [rectangle], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredEllipseArcHandleRef.current).toBeNull();
  });
});
