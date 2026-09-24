// types
import { TBooleanNodesPayload, handleBooleanNodes } from './handleBooleanNodes';
import { TDesignState } from '../../types';

// utils
import { handleSelectionPerParent } from '../handleSelectionPerParent/handleSelectionPerParent';

export const handleBooleanSelection = (state: TDesignState, { groupId, operation }: TBooleanNodesPayload): void =>
  handleSelectionPerParent(state, groupId, (draft, parentGroupId) => handleBooleanNodes(draft, { groupId: parentGroupId, operation }));
