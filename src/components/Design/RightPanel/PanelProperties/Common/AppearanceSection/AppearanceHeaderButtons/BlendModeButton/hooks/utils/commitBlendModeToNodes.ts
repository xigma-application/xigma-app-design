// store
import { AppDispatch } from 'store';

// types
import { BlendMode } from 'types/design/enums';
import { TStyledNode } from '../../../../types';

// utils
import { commitBlendModeChange } from './commitBlendModeChange';
import { commitOnNodes } from '../../../../utils/commitOnNodes';

export const commitBlendModeToNodes = (dispatch: AppDispatch, nodes: TStyledNode[], blendMode: BlendMode): void =>
  commitOnNodes(dispatch, nodes, (node) => commitBlendModeChange(dispatch, node.id, blendMode));
