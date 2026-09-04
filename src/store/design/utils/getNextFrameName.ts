// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNextNodeName } from './getNextNodeName';

export const getNextFrameName = (nodes: Record<string, TSceneNode>): string => getNextNodeName(nodes, NodeType.frame, 'Frame');
