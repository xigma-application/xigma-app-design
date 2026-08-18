// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { getEllipseArcRatioHandleAtPoint } from '../getEllipseArcRatioHandleAtPoint';

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

describe('getEllipseArcRatioHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    // result
    expect(getEllipseArcRatioHandleAtPoint({ x: 50, y: 50 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    // result
    expect(getEllipseArcRatioHandleAtPoint({ x: 50, y: 50 }, [ellipse(), ellipse({ id: 'ellipse-2' })], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the selected node is not an ellipse', () => {
    // result
    expect(getEllipseArcRatioHandleAtPoint({ x: 50, y: 50 }, [rectangle], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null once the shape renders too small on screen', () => {
    // result
    expect(getEllipseArcRatioHandleAtPoint({ x: 50, y: 50 }, [ellipse()], { x: 0, y: 0, zoom: 0.9 })).toBeNull();
  });

  it('should detect the handle at dead center on an uncut, unmodified ellipse (arcRatio 0)', () => {
    // result — works even without any cut, unlike the Sweep/Start handles
    expect(getEllipseArcRatioHandleAtPoint({ x: 50, y: 50 }, [ellipse()], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: 'ellipse-1',
      rotation: 0,
    });
  });

  it('should return null far away from the handle', () => {
    // result
    expect(getEllipseArcRatioHandleAtPoint({ x: 100, y: 100 }, [ellipse()], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should move to the bisector of the filled majority arc once arcRatio and a cut both exist', () => {
    // mock — arcStartAngle 0, arcEndAngle 90 -> majorArc {majorStart: 90, majorSweep: 270}, bisector 225°
    const node = ellipse({ arcEndAngle: 90, arcRatio: 1, arcStartAngle: 0 });

    // result
    expect(getEllipseArcRatioHandleAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getEllipseArcRatioHandleAtPoint({ x: 14.644661, y: 85.355339 }, [node], IDENTITY_VIEWPORT)).toMatchObject({
      nodeId: 'ellipse-1',
    });
  });

  it('should move to the complementary (gap) bisector when arcRatioInverted is set', () => {
    // mock — the mirror-opposite point from the non-inverted case above
    const node = ellipse({ arcEndAngle: 90, arcRatio: 1, arcRatioInverted: true, arcStartAngle: 0 });

    // result
    expect(getEllipseArcRatioHandleAtPoint({ x: 14.644661, y: 85.355339 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getEllipseArcRatioHandleAtPoint({ x: 85.355339, y: 14.644661 }, [node], IDENTITY_VIEWPORT)).toMatchObject({
      nodeId: 'ellipse-1',
    });
  });
});
