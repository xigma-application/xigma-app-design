// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getIsolatedSubtree } from '../getIsolatedSubtree';

const createNode = (id: string, type: NodeType, childIds: string[] = []): TSceneNode => ({ childIds, id, type }) as unknown as TSceneNode;
const createRenderer = (nodes: TSceneNode[]): TMaskRenderer =>
  ({ sceneNodeById: new Map(nodes.map((node) => [node.id, node])) }) as unknown as TMaskRenderer;

describe('getIsolatedSubtree', () => {
  it('should be empty for a node without children', () => {
    // result
    expect(getIsolatedSubtree(createRenderer([]), { id: 'r', type: NodeType.rectangle } as unknown as TSceneNode)).toEqual([]);
  });

  it('should collect every nested descendant of a measurable subtree', () => {
    // mock
    const inner = createNode('inner', NodeType.rectangle);
    const middle = createNode('middle', NodeType.frame, ['inner']);
    const frame = createNode('frame', NodeType.frame, ['middle']);

    // result
    expect(getIsolatedSubtree(createRenderer([frame, middle, inner]), frame)?.map(({ id }) => id)).toEqual(['middle', 'inner']);
  });

  it('should be null when any descendant is of a type that cannot be measured', () => {
    // mock
    const text = createNode('text', NodeType.text);
    const frame = createNode('frame', NodeType.frame, ['text']);

    // result
    expect(getIsolatedSubtree(createRenderer([frame, text]), frame)).toBeNull();
  });
});
