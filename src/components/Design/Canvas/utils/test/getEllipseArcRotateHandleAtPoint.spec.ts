// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { getEllipseArcRotateHandleAtPoint } from '../getEllipseArcRotateHandleAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
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
  ...overrides,
});

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

describe('getEllipseArcRotateHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    // result
    expect(getEllipseArcRotateHandleAtPoint({ x: 100, y: 50 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    // result
    expect(
      getEllipseArcRotateHandleAtPoint(
        { x: 100, y: 50 },
        [ellipse({ arcEndAngle: 0 }), ellipse({ arcEndAngle: 0, id: 'ellipse-2' })],
        IDENTITY_VIEWPORT,
      ),
    ).toBeNull();
  });

  it('should return null when the selected node is not an ellipse', () => {
    // result
    expect(getEllipseArcRotateHandleAtPoint({ x: 100, y: 50 }, [rectangle], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null on a full circle with no cut at all', () => {
    // result — arcStartAngle === arcEndAngle both default to 90°, no rotate handle to grab
    expect(getEllipseArcRotateHandleAtPoint({ x: 100, y: 50 }, [ellipse()], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null on a fully cut-away shape', () => {
    // result — arcStartAngle defaults to 90; a full 360° lap cut (arcEndAngle 450) collapses majorSweep to 0
    expect(getEllipseArcRotateHandleAtPoint({ x: 100, y: 50 }, [ellipse({ arcEndAngle: 450 })], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null once the shape renders too small on screen', () => {
    // result
    expect(getEllipseArcRotateHandleAtPoint({ x: 100, y: 50 }, [ellipse({ arcEndAngle: 0 })], { x: 0, y: 0, zoom: 0.9 })).toBeNull();
  });

  it('should detect the handle at the default arcStartAngle (90°, east rim) once a cut exists', () => {
    // mock — cutting arcEndAngle from 90 (default) to 0 leaves arcStartAngle at its own default (90)
    const node = ellipse({ arcEndAngle: 0 });

    // result
    expect(getEllipseArcRotateHandleAtPoint({ x: 100, y: 50 }, [node], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: 'ellipse-1',
      rotation: 0,
    });
  });

  it('should return null far away from the handle', () => {
    // result
    expect(getEllipseArcRotateHandleAtPoint({ x: 0, y: 0 }, [ellipse({ arcEndAngle: 0 })], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect the handle at its physically flipped position when flipY is set', () => {
    // mock — arcStartAngle 90° (east, 100, 50) mirrored across the center (50, 50) on y stays (100, 50)
    // so use arcStartAngle 0 (north, 50, 0) instead, which flips to (50, 100)
    const node = ellipse({ arcEndAngle: 90, arcStartAngle: 0, flipY: true });

    // result
    expect(getEllipseArcRotateHandleAtPoint({ x: 50, y: 100 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ flipY: true });
  });
});
