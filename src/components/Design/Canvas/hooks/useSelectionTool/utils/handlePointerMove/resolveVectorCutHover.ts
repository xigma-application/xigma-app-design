// store
import { selectActiveTool } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

export const resolveVectorCutHover = (event: PointerEvent, setClassName: (className: string | null) => void): void => {
  if (selectActiveTool(store.getState()) === ToolName.cut && event.buttons === 0) {
    setClassName('cut-off');
  }
};
