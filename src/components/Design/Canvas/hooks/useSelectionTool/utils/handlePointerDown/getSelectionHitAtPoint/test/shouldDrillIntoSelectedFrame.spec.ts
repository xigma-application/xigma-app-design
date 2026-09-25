// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { shouldDrillIntoSelectedFrame } from '../shouldDrillIntoSelectedFrame';

const clickThroughMock = vi.fn();
const onLabelMock = vi.fn();

vi.mock('store/design/utils/nodeHierarchy/isClickThroughFrame', () => ({
  isClickThroughFrame: (...args: unknown[]): unknown => clickThroughMock(...args),
}));
vi.mock('../../../../../../utils/isPointOnNodeNameLabel', () => ({
  isPointOnNodeNameLabel: (...args: unknown[]): unknown => onLabelMock(...args),
}));

const container = (type: NodeType, childIds: string[]): TSceneNode => ({ childIds, id: 'c', type }) as unknown as TSceneNode;

describe('shouldDrillIntoSelectedFrame', () => {
  it('should drill into a selected click-through frame or section with children, except from its label', () => {
    // mock
    clickThroughMock.mockReturnValue(true);
    onLabelMock.mockReturnValueOnce(false).mockReturnValueOnce(true);

    // result
    expect(shouldDrillIntoSelectedFrame(container(NodeType.section, ['a']), {}, { x: 0, y: 0 }, 1)).toBe(true);
    expect(shouldDrillIntoSelectedFrame(container(NodeType.frame, ['a']), {}, { x: 0, y: 0 }, 1)).toBe(false);
  });

  it('should always drill into a selected nested frame with children', () => {
    // mock
    clickThroughMock.mockReturnValue(false);

    // result
    expect(shouldDrillIntoSelectedFrame(container(NodeType.frame, ['a']), {}, { x: 0, y: 0 }, 1)).toBe(true);
  });

  it('should not drill into an empty container or another layer', () => {
    // result
    expect(shouldDrillIntoSelectedFrame(container(NodeType.frame, []), {}, { x: 0, y: 0 }, 1)).toBe(false);
    expect(shouldDrillIntoSelectedFrame(container(NodeType.group, ['a']), {}, { x: 0, y: 0 }, 1)).toBe(false);
  });
});
