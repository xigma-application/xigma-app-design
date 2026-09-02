// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveEllipseArcRotateHandleHover } from '../resolveEllipseArcRotateHandleHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

// arcEndAngle: 0 (vs. the default arcStartAngle of 90) gives the shape an actual partial cut, which is
// what makes the Start/rotate handle exist at all
const cutEllipse: TEllipseNode = {
  arcEndAngle: 0,
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

const uncutEllipse: TEllipseNode = { ...cutEllipse, arcEndAngle: undefined };

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

describe('resolveEllipseArcRotateHandleHover', () => {
  it("should mark the ellipse's own id when the point sits precisely on its Start handle dot", () => {
    // mock — arcStartAngle stays at its default (90), whose rest position is (100, 50)
    const refs = createCanvasRefs();

    // before
    resolveEllipseArcRotateHandleHover({ x: 100, y: 50 }, [cutEllipse], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredEllipseArcRotateHandleRef.current).toBe('ellipse-1');
  });

  it('should clear the ref for a hover elsewhere on the shape — only precisely on the dot counts', () => {
    // mock
    const refs = createCanvasRefs();

    // before — dead center of the ellipse, far from the (100, 50) handle
    resolveEllipseArcRotateHandleHover({ x: 50, y: 50 }, [cutEllipse], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredEllipseArcRotateHandleRef.current).toBeNull();
  });

  it('should clear the ref when the ellipse has no cut — the Start handle does not exist yet', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveEllipseArcRotateHandleHover({ x: 100, y: 50 }, [uncutEllipse], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredEllipseArcRotateHandleRef.current).toBeNull();
  });

  it('should clear the ref when nothing (or something other than a single ellipse) is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveEllipseArcRotateHandleHover({ x: 100, y: 50 }, [rectangle], IDENTITY_VIEWPORT, refs);

    // result
    expect(refs.hover.hoveredEllipseArcRotateHandleRef.current).toBeNull();
  });
});
