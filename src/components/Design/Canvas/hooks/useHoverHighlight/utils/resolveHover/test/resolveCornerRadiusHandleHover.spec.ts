// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveCornerRadiusHandleHover } from '../resolveCornerRadiusHandleHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rectangle: TRectangleNode = {
  cornerRadius: 20,
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

describe('resolveCornerRadiusHandleHover', () => {
  it('should mark the node id and resolved corner when the point sits precisely on the nw handle dot', () => {
    // mock — a 100x100 rectangle with cornerRadius 20: the nw handle rests at (20, 20)
    const refs = createCanvasRefs();

    // before
    resolveCornerRadiusHandleHover({ x: 20, y: 20 }, [rectangle], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredCornerRadiusHandleRef.current).toEqual({ corner: 'nw', nodeId: 'rect-1' });
  });

  it('should clear the ref for a hover elsewhere on the shape — only precisely on a handle counts', () => {
    // mock
    const refs = createCanvasRefs();

    // before — dead center of the rectangle, far from any corner handle
    resolveCornerRadiusHandleHover({ x: 50, y: 50 }, [rectangle], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredCornerRadiusHandleRef.current).toBeNull();
  });

  it('should clear the ref when nothing (or something other than a rectangle-like node) is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveCornerRadiusHandleHover({ x: 20, y: 20 }, [ellipse], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredCornerRadiusHandleRef.current).toBeNull();
  });
});
