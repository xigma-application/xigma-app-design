// types
import { NodeType } from 'types/design/enums';
import { TGroupLikeNode } from 'types/design/types';

export const getGroupBoundsChildIds = (group: TGroupLikeNode): string[] =>
  group.type === NodeType.mask ? group.childIds.slice(-1) : group.childIds;
