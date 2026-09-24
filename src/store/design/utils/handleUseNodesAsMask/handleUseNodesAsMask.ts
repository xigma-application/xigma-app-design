// types
import { TDesignState } from '../../types';

// utils
import { handleConvertGroupToMask } from './handleConvertGroupToMask';
import { handleGroupNodes } from '../handleGroupNodes/handleGroupNodes';

export const handleUseNodesAsMask = (state: TDesignState, groupId: string): void => {
  handleGroupNodes(state, groupId);
  handleConvertGroupToMask(state, groupId);
};
