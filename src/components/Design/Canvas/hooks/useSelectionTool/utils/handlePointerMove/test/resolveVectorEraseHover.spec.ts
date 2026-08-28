// store
import { setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorEraseHover } from '../resolveVectorEraseHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, buttons = 0): PointerEvent =>
  new PointerEvent('pointermove', { buttons, clientX: x, clientY: y });

describe('resolveVectorEraseHover', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should clear the brush centre and leave the cursor untouched when Erase is not active', () => {
    // mock
    const canvasRefs = createCanvasRefs({ vectorErase: { eraseBrushCenterRef: { current: { x: 1, y: 1 } } } });
    const setClassName = vi.fn();

    // before
    resolveVectorEraseHover(createCanvas(), pointerEvent(20, 0), canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorErase.eraseBrushCenterRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should keep tracking the brush centre while a button is held, so the circle follows the erase drag', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.erase));
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorEraseHover(createCanvas(), pointerEvent(20, 5, 1), canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorErase.eraseBrushCenterRef.current).toEqual({ x: 20, y: 5 });
    expect(setClassName).toHaveBeenCalledWith('erase');
  });

  it('should track the brush centre in world space and force the erase cursor on an idle hover', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.erase));
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorEraseHover(createCanvas(), pointerEvent(30, 40), canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorErase.eraseBrushCenterRef.current).toEqual({ x: 30, y: 40 });
    expect(setClassName).toHaveBeenCalledWith('erase');
  });
});
