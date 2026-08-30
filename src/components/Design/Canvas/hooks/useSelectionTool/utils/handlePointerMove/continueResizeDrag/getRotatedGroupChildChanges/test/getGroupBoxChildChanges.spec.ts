// utils
import { getGroupBoxChildChanges } from '../getGroupBoxChildChanges';
import { getNextGroupChildPoint } from '../getNextGroupChildPoint';

const groupOrigin = { height: 100, width: 100, x: 0, y: 0 };

describe('getGroupBoxChildChanges', () => {
  it('should scale width/height and reposition around the mapped center, with no flip field when unflippable', () => {
    const newGroupBox = { height: 100, width: 200, x: 0, y: 0 };
    const nextPoint = getNextGroupChildPoint(groupOrigin, 0, newGroupBox, { x: 1, y: 1 });

    const changes = getGroupBoxChildChanges(
      { flip: null, height: 20, rotation: 0, width: 20, x: 40, y: 40 },
      groupOrigin,
      0,
      newGroupBox,
      { x: 1, y: 1 },
      nextPoint,
    );

    expect(changes).toEqual({ height: 20, width: 40, x: 80, y: 40 });
  });

  it('should toggle flipX when the mirror sign is negative on a flippable child', () => {
    const newGroupBox = { height: 100, width: 30, x: 100, y: 0 };
    const mirror = { x: -1, y: 1 };
    const nextPoint = getNextGroupChildPoint(groupOrigin, 0, newGroupBox, mirror);

    const changes = getGroupBoxChildChanges(
      { flip: { x: false, y: false }, height: 20, rotation: 0, width: 20, x: 40, y: 40 },
      groupOrigin,
      0,
      newGroupBox,
      mirror,
      nextPoint,
    );

    expect(changes).toMatchObject({ flipX: true, flipY: false });
  });

  it('should swap which axis mirrors for a child rotated 90 degrees relative to the group', () => {
    const newGroupBox = { height: 100, width: 30, x: 100, y: 0 };
    const mirror = { x: -1, y: 1 };
    const nextPoint = getNextGroupChildPoint(groupOrigin, 0, newGroupBox, mirror);

    const changes = getGroupBoxChildChanges(
      { flip: { x: false, y: false }, height: 20, rotation: 90, width: 20, x: 10, y: 40 },
      groupOrigin,
      0,
      newGroupBox,
      mirror,
      nextPoint,
    );

    expect(changes).toMatchObject({ flipX: false, flipY: true });
  });
});
