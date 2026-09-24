// types
import { TSceneNode } from 'types/design/types';

// utils
import { getVisibleRenderNodes } from '../getVisibleRenderNodes';

describe('getVisibleRenderNodes', () => {
  it('should drop hidden nodes', () => {
    // mock
    const visible = { id: 'a' } as TSceneNode;
    const hidden = { hidden: true, id: 'b' } as TSceneNode;

    // before
    const result = getVisibleRenderNodes([visible, hidden]);

    // result
    expect(result).toEqual([visible]);
  });

  it('should return the very same array for the same source array', () => {
    // mock
    const source = [{ id: 'a' } as TSceneNode];

    // before
    const first = getVisibleRenderNodes(source);

    // result
    expect(getVisibleRenderNodes(source)).toBe(first);
  });
});
