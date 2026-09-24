// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isPanelTypeSelection } from '../isPanelTypeSelection';

const makeNode = (type: NodeType): TSceneNode => ({ id: type, name: type, parentId: null, type }) as TSceneNode;

describe('isPanelTypeSelection', () => {
  it('should accept a selection made only of types that have a panel', () => {
    // action / result
    expect(isPanelTypeSelection([makeNode(NodeType.frame), makeNode(NodeType.rectangle), makeNode(NodeType.boolean)])).toBe(true);
  });

  it('should reject a selection with a type that has no panel', () => {
    // action / result
    expect(isPanelTypeSelection([makeNode(NodeType.rectangle), makeNode(NodeType.ellipse)])).toBe(false);
  });

  it('should reject an empty selection or a missing node', () => {
    // action / result
    expect(isPanelTypeSelection([])).toBe(false);
    expect(isPanelTypeSelection([undefined])).toBe(false);
  });
});
