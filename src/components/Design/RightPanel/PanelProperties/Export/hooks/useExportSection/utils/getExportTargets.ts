// types
import { NodeType } from 'types/design/enums';
import { TExportTarget } from '../../../types';
import { TSceneNode } from 'types/design/types';

export const getExportTargets = (selectedNodes: TSceneNode[], pageName: string): TExportTarget[] => {
  if (selectedNodes.length > 0) {
    return selectedNodes.filter((node) => node.type !== NodeType.slice || !node.hidden).map(({ id, name }) => ({ id, name }));
  }

  return [{ id: null, name: pageName }];
};
