// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';
import { TDraftRect } from 'types/canvas';
import { TSvgAncestorGroup } from './types';

// utils
import { formatSvgNumber } from './formatSvgNumber';
import { getSvgAncestorLocalTransform } from './getSvgAncestorLocalTransform';
import { getSvgCssBlendMode } from './getSvgCssBlendMode';

const getAncestorChain = (parentId: string | null, nodesById: Record<string, TSceneNode>): TBoxSceneNode[] => {
  const chain: TBoxSceneNode[] = [];
  let current = parentId ? (nodesById[parentId] as TBoxSceneNode | undefined) : undefined;

  while (current) {
    chain.push(current);
    current = current.parentId ? (nodesById[current.parentId] as TBoxSceneNode | undefined) : undefined;
  }

  return chain.reverse();
};

const getAncestorGroupMarkup = (
  ancestor: TBoxSceneNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  allowsRotationTransform: boolean,
): string => {
  const transform = getSvgAncestorLocalTransform(ancestor, nodesById);
  const blendValue = getSvgCssBlendMode(ancestor.blendMode);
  const cx = formatSvgNumber(transform.localCenter.x - bounds.x);
  const cy = formatSvgNumber(transform.localCenter.y - bounds.y);
  const styleAttribute = blendValue ? ` style="mix-blend-mode: ${blendValue}; isolation: isolate"` : '';
  const transformAttribute =
    allowsRotationTransform && transform.localRotation !== 0
      ? ` transform="rotate(${formatSvgNumber(transform.localRotation)}, ${cx}, ${cy})"`
      : '';

  return transformAttribute || styleAttribute ? `<g${transformAttribute}${styleAttribute}>` : '';
};

export const getSvgAncestorGroups = (
  parentId: string | null,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  allowsRotationTransform: boolean,
): TSvgAncestorGroup[] =>
  getAncestorChain(parentId, nodesById).reduce<TSvgAncestorGroup[]>((groups, ancestor) => {
    const markup = getAncestorGroupMarkup(ancestor, nodesById, bounds, allowsRotationTransform);

    if (markup) {
      groups.push({ id: `${ancestor.id}|${markup}`, markup });
    }

    return groups;
  }, []);
