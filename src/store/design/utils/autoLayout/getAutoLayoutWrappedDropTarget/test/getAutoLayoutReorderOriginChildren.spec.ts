// utils
import { getAutoLayoutReorderOriginChildren } from '../getAutoLayoutReorderOriginChildren';

const CHILDREN = [
  { height: 10, id: '1', width: 10 },
  { height: 10, id: '2', width: 10 },
  { height: 10, id: '4', width: 10 },
];

describe('getAutoLayoutReorderOriginChildren', () => {
  it('should return the list untouched when there is no reorder in progress', () => {
    expect(getAutoLayoutReorderOriginChildren(CHILDREN, null, { height: 10, width: 10 })).toBe(CHILDREN);
  });

  it('should splice a dragged placeholder back in at the origin index', () => {
    const result = getAutoLayoutReorderOriginChildren(CHILDREN, 2, { height: 20, width: 30 });

    expect(result).toEqual([
      { height: 10, id: '1', width: 10 },
      { height: 10, id: '2', width: 10 },
      { height: 20, id: '__dragged__', width: 30 },
      { height: 10, id: '4', width: 10 },
    ]);
  });
});
