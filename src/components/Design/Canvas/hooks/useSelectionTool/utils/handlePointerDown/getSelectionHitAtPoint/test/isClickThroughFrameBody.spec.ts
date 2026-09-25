// types
import { TSceneNode } from 'types/design/types';

// utils
import { isClickThroughFrameBody } from '../isClickThroughFrameBody';

const clickThroughMock = vi.fn();
const onLabelMock = vi.fn();

vi.mock('store/design/utils/nodeHierarchy/isClickThroughFrame', () => ({
  isClickThroughFrame: (...args: unknown[]): unknown => clickThroughMock(...args),
}));
vi.mock('../../../../../../utils/isPointOnNodeNameLabel', () => ({
  isPointOnNodeNameLabel: (...args: unknown[]): unknown => onLabelMock(...args),
}));

const node = { id: 'f' } as TSceneNode;

describe('isClickThroughFrameBody', () => {
  it('should be true on the body of a click-through container, off its name label', () => {
    // mock
    clickThroughMock.mockReturnValue(true);
    onLabelMock.mockReturnValue(false);

    // result
    expect(isClickThroughFrameBody(node, {}, { x: 1, y: 2 }, 2)).toBe(true);
    expect(onLabelMock).toHaveBeenCalledWith({ x: 1, y: 2 }, node, 2, {});
  });

  it('should be false on its label or for a container that is not click-through', () => {
    // mock
    clickThroughMock.mockReturnValueOnce(true).mockReturnValueOnce(false);
    onLabelMock.mockReturnValue(true);

    // result
    expect(isClickThroughFrameBody(node, {}, { x: 1, y: 2 }, 1)).toBe(false);
    expect(isClickThroughFrameBody(node, {}, { x: 1, y: 2 }, 1)).toBe(false);
  });
});
