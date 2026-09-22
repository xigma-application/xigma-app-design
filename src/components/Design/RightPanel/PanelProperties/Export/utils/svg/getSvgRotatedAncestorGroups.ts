// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';
import { TDraftRect } from 'types/canvas';
import { TSvgAncestorGroup } from './types';

// utils
import { formatSvgNumber } from './formatSvgNumber';
import { getSvgAncestorLocalTransform } from './getSvgAncestorLocalTransform';

const getAncestorChain = (parentId: string | null, nodesById: Record<string, TSceneNode>): TBoxSceneNode[] => {
  const chain: TBoxSceneNode[] = [];
  let current = parentId ? (nodesById[parentId] as TBoxSceneNode | undefined) : undefined;

  while (current) {
    chain.push(current);
    current = current.parentId ? (nodesById[current.parentId] as TBoxSceneNode | undefined) : undefined;
  }

  return chain.reverse();
};

export const getSvgRotatedAncestorGroups = (
  parentId: string | null,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): TSvgAncestorGroup[] =>
  getAncestorChain(parentId, nodesById).reduce<TSvgAncestorGroup[]>((groups, ancestor) => {
    const transform = getSvgAncestorLocalTransform(ancestor, nodesById);

    if (transform.localRotation !== 0) {
      const cx = formatSvgNumber(transform.localCenter.x - bounds.x);
      const cy = formatSvgNumber(transform.localCenter.y - bounds.y);

      groups.push({ id: ancestor.id, markup: `<g transform="rotate(${formatSvgNumber(transform.localRotation)}, ${cx}, ${cy})">` });
    }

    return groups;
  }, []);
