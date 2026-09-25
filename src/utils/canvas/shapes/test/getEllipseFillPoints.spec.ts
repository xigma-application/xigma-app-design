// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { getEllipseFillPoints } from '../getEllipseFillPoints';

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#ff0000',
  height: 20,
  id: 'e',
  name: 'e',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getEllipseFillPoints', () => {
  it('should return a full ellipse as one closed loop of the ellipse segment count', () => {
    expect(getEllipseFillPoints(ellipse())).toHaveLength(64);
  });

  it('should return an arc as a fan from the center', () => {
    expect(getEllipseFillPoints(ellipse({ arcEndAngle: 180, arcStartAngle: 0 }))).toHaveLength(34);
  });

  it('should return a donut arc as an outer/inner ring outline', () => {
    expect(getEllipseFillPoints(ellipse({ arcEndAngle: 180, arcRatio: 0.5, arcStartAngle: 0 }))).toHaveLength(66);
  });

  it('should round the corners of a cut arc with a corner radius, leaving the plain shape without one', () => {
    // mock
    const pie = ellipse({ arcEndAngle: 180, height: 100, width: 100 });

    // before
    const sharp = getEllipseFillPoints(pie);
    const rounded = getEllipseFillPoints({ ...pie, cornerRadius: 10 });

    // result
    expect(sharp[0]).toEqual({ x: pie.x + 50, y: pie.y + 50 });
    expect(rounded).not.toContainEqual(sharp[0]);
    expect(rounded.length).toBeGreaterThan(sharp.length);
  });
});
