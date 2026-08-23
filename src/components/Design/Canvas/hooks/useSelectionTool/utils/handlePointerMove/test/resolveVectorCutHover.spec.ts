// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { resolveVectorCutHover } from '../resolveVectorCutHover';

const pointerEvent = (buttons = 0): PointerEvent => new PointerEvent('pointermove', { buttons });

describe('resolveVectorCutHover', () => {
  afterEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should force the "cut-off" cursor whenever Cut is active and no button is held, even if an earlier hover resolver set a different cursor', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.cut));

    const setClassNameMock = vi.fn();

    // before
    resolveVectorCutHover(pointerEvent(), setClassNameMock);

    // result
    expect(setClassNameMock).toHaveBeenCalledWith('cut-off');
  });

  it('should not touch the cursor while a button is held (an active cut drag already owns the "cut-on" cursor)', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.cut));

    const setClassNameMock = vi.fn();

    // before — left mouse button held
    resolveVectorCutHover(pointerEvent(1), setClassNameMock);

    // result
    expect(setClassNameMock).not.toHaveBeenCalled();
  });

  it('should not touch the cursor when Cut is not the active tool', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.default));

    const setClassNameMock = vi.fn();

    // before
    resolveVectorCutHover(pointerEvent(), setClassNameMock);

    // result
    expect(setClassNameMock).not.toHaveBeenCalled();
  });
});
