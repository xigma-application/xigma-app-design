// types
import { LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutChildPositions } from '../getAutoLayoutChildPositions';

describe('getAutoLayoutChildPositions', () => {
  it('should stack children left to right, offsetting by width plus the gap', () => {
    // action
    const positions = getAutoLayoutChildPositions(LayoutMode.horizontal, 10, { x: 100, y: 200 }, [
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 50 },
    ]);

    // result
    expect(positions).toEqual([
      { id: 'a', x: 100, y: 200 },
      { id: 'b', x: 140, y: 200 },
    ]);
  });

  it('should stack children top to bottom, offsetting by height plus the gap', () => {
    // action
    const positions = getAutoLayoutChildPositions(LayoutMode.vertical, 10, { x: 100, y: 200 }, [
      { height: 30, id: 'a', width: 20 },
      { height: 50, id: 'b', width: 20 },
    ]);

    // result
    expect(positions).toEqual([
      { id: 'a', x: 100, y: 200 },
      { id: 'b', x: 100, y: 240 },
    ]);
  });

  it('should return an empty array for a frame with no children', () => {
    // action
    const positions = getAutoLayoutChildPositions(LayoutMode.horizontal, 10, { x: 0, y: 0 }, []);

    // result
    expect(positions).toEqual([]);
  });
});
