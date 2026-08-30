// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNextSectionName } from '../getNextSectionName';

const buildSection = (name: string): TSceneNode =>
  ({ fill: '#fff', height: 10, id: name, name, parentId: null, rotation: 0, type: NodeType.section, width: 10, x: 0, y: 0 }) as TSceneNode;

const buildRect = (name: string): TSceneNode =>
  ({
    fill: '#fff',
    height: 10,
    id: name,
    name,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const nodesFrom = (...nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('getNextSectionName', () => {
  it('should return "Section 1" when there are no numbered sections', () => {
    // result
    expect(getNextSectionName(nodesFrom(buildSection('Hero'), buildSection('Card')))).toBe('Section 1');
  });

  it('should return "Section 1" when the map is empty', () => {
    // result
    expect(getNextSectionName({})).toBe('Section 1');
  });

  it('should return one above the highest numbered section', () => {
    // result
    expect(getNextSectionName(nodesFrom(buildSection('Section 1'), buildSection('Section 2')))).toBe('Section 3');
  });

  it('should ignore gaps and only track the maximum', () => {
    // result
    expect(getNextSectionName(nodesFrom(buildSection('Section 1'), buildSection('Section 7'), buildSection('Hero')))).toBe('Section 8');
  });

  it('should ignore numbered names on non-section nodes', () => {
    // result
    expect(getNextSectionName(nodesFrom(buildRect('Section 9'), buildSection('Section 2')))).toBe('Section 3');
  });

  it('should not match names that merely contain "Section <n>"', () => {
    // result
    expect(getNextSectionName(nodesFrom(buildSection('Section 3 draft'), buildSection('My Section 9')))).toBe('Section 1');
  });
});
