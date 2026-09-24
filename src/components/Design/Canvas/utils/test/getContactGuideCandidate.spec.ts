// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getContactGuideCandidate } from '../getContactGuideCandidate';

const node = {
  height: 20,
  id: 'r',
  name: 'r',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 5,
  y: 6,
} as unknown as TSceneNode;

describe('getContactGuideCandidate', () => {
  it('should pair the node id with its stroked rotated bounds', () => {
    // before
    const candidate = getContactGuideCandidate(node);

    // result
    expect(candidate.id).toBe('r');
    expect(candidate.bounds).toMatchObject({ height: 20, width: 10, x: 5, y: 6 });
  });

  it('should return the very same candidate for the same node object', () => {
    // mock
    const first = getContactGuideCandidate(node);

    // result
    expect(getContactGuideCandidate(node)).toBe(first);
  });
});
