// others
import { PANEL_SECTIONS } from '../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodesPanelSections } from '../getNodesPanelSections';

const makeNode = (type: NodeType): TSceneNode => ({ type }) as TSceneNode;

describe('getNodesPanelSections', () => {
  it('should return the sections that every node type shares', () => {
    // action / result
    expect(getNodesPanelSections([makeNode(NodeType.rectangle), makeNode(NodeType.boolean)], PANEL_SECTIONS)).toEqual([
      'position',
      'layout',
      'appearance',
      'fill',
      'stroke',
      'effects',
      'export',
    ]);
  });

  it('should keep corner radius when every node is a rectangle or a frame', () => {
    // action / result
    expect(getNodesPanelSections([makeNode(NodeType.rectangle), makeNode(NodeType.frame)], PANEL_SECTIONS)).toContain('cornerRadius');
  });

  it('should return nothing when a node type has no panel', () => {
    // action / result
    expect(getNodesPanelSections([makeNode(NodeType.rectangle), makeNode(NodeType.text)], PANEL_SECTIONS)).toEqual([]);
  });
});
