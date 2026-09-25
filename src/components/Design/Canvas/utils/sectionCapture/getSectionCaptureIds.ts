// types
import { TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { getSectionSiblingIds } from './getSectionSiblingIds';
import { isNodeInsideBox } from './isNodeInsideBox';

export const getSectionCaptureIds = (section: TSectionNode, nodesById: Record<string, TSceneNode>, rootOrder: string[]): string[] =>
  getSectionSiblingIds(section, nodesById, rootOrder).filter(
    (id) => id !== section.id && nodesById[id] !== undefined && isNodeInsideBox(nodesById[id], section),
  );
