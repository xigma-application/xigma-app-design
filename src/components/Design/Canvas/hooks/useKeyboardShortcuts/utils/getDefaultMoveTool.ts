// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

export const getDefaultMoveTool = (): ToolName => (selectVectorEditingNodeId(store.getState()) ? ToolName.move : ToolName.default);
