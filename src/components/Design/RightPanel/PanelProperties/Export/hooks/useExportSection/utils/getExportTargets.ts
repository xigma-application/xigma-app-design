// types
import { TExportTarget } from '../../../types';
import { TSceneNode } from 'types/design/types';

export const getExportTargets = (selectedNodes: TSceneNode[], pageName: string): TExportTarget[] =>
  selectedNodes.length > 0 ? selectedNodes.map(({ id, name }) => ({ id, name })) : [{ id: null, name: pageName }];
