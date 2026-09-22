// types
import { TSvgAncestorGroup } from './types';

export const updateSvgAncestorGroupStack = (
  elements: string[],
  openGroups: TSvgAncestorGroup[],
  groups: TSvgAncestorGroup[],
): TSvgAncestorGroup[] => {
  let commonLength = 0;

  while (commonLength < openGroups.length && commonLength < groups.length && openGroups[commonLength].id === groups[commonLength].id) {
    commonLength += 1;
  }

  for (let index = openGroups.length - 1; index >= commonLength; index -= 1) {
    elements.push('</g>');
  }

  for (let index = commonLength; index < groups.length; index += 1) {
    elements.push(groups[index].markup);
  }

  return groups;
};
