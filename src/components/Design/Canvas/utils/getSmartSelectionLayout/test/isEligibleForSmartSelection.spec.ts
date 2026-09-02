// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { isEligibleForSmartSelection } from '../isEligibleForSmartSelection';

const rect = (overrides: Partial<Omit<TRectangleNode, 'type'>> = {}): TSceneNode =>
  ({
    fill: '#000',
    height: 100,
    id: 'r',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const line = (): TSceneNode =>
  ({ id: 'l', name: 'Line', parentId: null, stroke: '#000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 }) as TSceneNode;

describe('isEligibleForSmartSelection', () => {
  it('should reject fewer than 2 nodes', () => {
    expect(isEligibleForSmartSelection([rect()])).toBe(false);
  });

  it('should accept 2 or more axis-aligned nodes', () => {
    expect(isEligibleForSmartSelection([rect({ id: 'a' }), rect({ id: 'b', rotation: 90 })])).toBe(true);
  });

  it('should reject a node rotated by anything other than a multiple of 90', () => {
    expect(isEligibleForSmartSelection([rect({ id: 'a' }), rect({ id: 'b', rotation: 45 })])).toBe(false);
  });

  it('should reject a node that has no rotation field at all', () => {
    expect(isEligibleForSmartSelection([rect({ id: 'a' }), line()])).toBe(false);
  });
});
