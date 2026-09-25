// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { isNodeInsideBox } from './isNodeInsideBox';

export const getSectionEjectIds = (section: TSectionNode, startBox: TDraftRect, nodesById: Record<string, TSceneNode>): string[] =>
  section.childIds.filter((id) => {
    const child = nodesById[id];
    return child !== undefined && isNodeInsideBox(child, startBox) && !isNodeInsideBox(child, section);
  });
