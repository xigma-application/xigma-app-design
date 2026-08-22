// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

export const getDefaultMoveTool = (): ToolName =>
  selectVectorEditingNodeIds(store.getState()).length > 0 ? ToolName.move : ToolName.default;
