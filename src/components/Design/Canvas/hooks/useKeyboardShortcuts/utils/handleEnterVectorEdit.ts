// store
import { selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { enterVectorEditMode } from '../../../utils/enterVectorEditMode';

export const handleEnterVectorEdit = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const vectorIds = selectSelectedIds(state).filter((id) => state.design.nodes[id]?.type === NodeType.vector);

  enterVectorEditMode(dispatch, vectorIds);
};
