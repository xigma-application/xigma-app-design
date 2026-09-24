// types
import { TSceneNode } from 'types/design/types';

// utils
import { isSelectionFromOneParent } from '../isSelectionFromOneParent';

const makeNode = (parentId: string | null): TSceneNode => ({ parentId }) as TSceneNode;

describe('isSelectionFromOneParent', () => {
  it('should be true when every layer shares the parent', () => {
    // action / result
    expect(isSelectionFromOneParent([makeNode('frame'), makeNode('frame')])).toBe(true);
    expect(isSelectionFromOneParent([makeNode(null), makeNode(null)])).toBe(true);
  });

  it('should be false when a layer has another parent', () => {
    // action / result
    expect(isSelectionFromOneParent([makeNode(null), makeNode('frame')])).toBe(false);
  });

  it('should be true for an empty selection', () => {
    // action / result
    expect(isSelectionFromOneParent([])).toBe(true);
  });
});
