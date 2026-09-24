// types
import { TPanelNodeType, TPanelSection } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getCommonPanelItems } from './getCommonPanelItems';
import { isPanelNodeType } from './isPanelNodeType';

export const getNodesPanelSections = (
  nodes: (TSceneNode | undefined)[],
  sectionsByType: Record<TPanelNodeType, TPanelSection[]>,
): TPanelSection[] => {
  const types = [...new Set(nodes.map((node) => node?.type))];

  if (types.length > 0 && types.every((type): type is TPanelNodeType => type !== undefined && isPanelNodeType(type))) {
    return getCommonPanelItems(sectionsByType, types);
  }

  return [];
};
