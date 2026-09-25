// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getDoubleClickedVectorNode } from '../getDoubleClickedVectorNode';

const getNodeAtPointMock = vi.fn();

vi.mock('../../../../utils/getNodeAtPoint/getNodeAtPoint', () => ({
  getNodeAtPoint: (...args: unknown[]): unknown => getNodeAtPointMock(...args),
}));

const viewport = { x: 0, y: 0, zoom: 1 };

describe('getDoubleClickedVectorNode', () => {
  it('should return the vector under the pointer', () => {
    // mock
    const vector = { id: 'v', type: NodeType.vector };
    getNodeAtPointMock.mockReturnValue(vector);

    // result
    expect(getDoubleClickedVectorNode({ x: 1, y: 2 }, [], viewport)).toBe(vector);
    expect(getNodeAtPointMock).toHaveBeenCalledWith({ x: 1, y: 2 }, [], viewport);
  });

  it('should return nothing for another layer or empty space', () => {
    // mock
    getNodeAtPointMock.mockReturnValueOnce({ id: 'r', type: NodeType.rectangle } as TSceneNode).mockReturnValueOnce(null);

    // result
    expect(getDoubleClickedVectorNode({ x: 1, y: 2 }, [], viewport)).toBeNull();
    expect(getDoubleClickedVectorNode({ x: 1, y: 2 }, [], viewport)).toBeNull();
  });
});
