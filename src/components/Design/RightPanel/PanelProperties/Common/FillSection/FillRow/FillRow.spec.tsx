import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode, useState } from 'react';

// components
import FillRow, { TFillRowProps } from './FillRow';
import { TooltipProvider } from 'shared';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// others
import { contrastCheckerStateCache } from 'shared/UITools/ColorPicker/Body/SolidPanel/ContrastChecker/utils/contrastCheckerStateCache';
import { DEFAULT_CONTRAST_CHECKER_STATE } from 'shared/UITools/ColorPicker/Body/SolidPanel/ContrastChecker/constants';

// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor, setImageFillPickerFocus } from 'store/design/slice';
import { store } from 'store';

// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

const usePatternThumbnailMock = vi.fn();

vi.mock('shared/UITools/ColorPicker/Body/PatternPanel/PatternSourcePreview/hooks/usePatternThumbnail', () => ({
  usePatternThumbnail: (...args: unknown[]): unknown => usePatternThumbnailMock(...args),
}));

const TestProviders = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsContext.Provider value={createCanvasRefs()}>
      <TooltipProvider>{children}</TooltipProvider>
    </CanvasRefsContext.Provider>
  </Provider>
);

const SOLID_PAINT: TPaint = { color: '#ff0000', opacity: 80, type: 'solid' };

// mirrors the real parent (FillSection): tracks which row owns the open picker and feeds it back
// down as a controlled prop, since FillRow itself no longer manages that state locally
const FillRowHarness = ({
  onPickerOpenChange,
  openPickerIndex: initialOpenPickerIndex = null,
  ...rest
}: TFillRowProps): ReturnType<typeof FillRow> => {
  const [openPickerIndex, setOpenPickerIndex] = useState(initialOpenPickerIndex);

  const handlePickerOpenChange = (isOpen: boolean): void => {
    onPickerOpenChange(isOpen);
    setOpenPickerIndex(isOpen ? rest.paintIndex : null);
  };

  return <FillRow {...rest} onPickerOpenChange={handlePickerOpenChange} openPickerIndex={openPickerIndex} />;
};

const ControlledFillRow = ({ initialPaint }: { initialPaint: TPaint }): ReturnType<typeof FillRow> => {
  const [paint, setPaint] = useState(initialPaint);

  return (
    <FillRowHarness
      canDrag
      isDragging={false}
      isSelected={false}
      nodeId="node-1"
      nodeIds={['node-1']}
      onChange={setPaint}
      onDragEnd={vi.fn()}
      onDragStart={vi.fn()}
      onPickerOpenChange={vi.fn()}
      onRemove={vi.fn()}
      onSelect={vi.fn()}
      onStartDrag={vi.fn()}
      onToggleVisible={vi.fn()}
      openPickerIndex={null}
      paint={paint}
      paintIndex={0}
      registerRow={vi.fn()}
    />
  );
};

const renderFillRow = (overrides: Partial<TFillRowProps> = {}): ReturnType<typeof render> =>
  render(
    <TestProviders>
      <FillRowHarness
        canDrag
        isDragging={false}
        isSelected={false}
        nodeId="node-1"
        nodeIds={['node-1']}
        onChange={vi.fn()}
        onDragEnd={vi.fn()}
        onDragStart={vi.fn()}
        onPickerOpenChange={vi.fn()}
        onRemove={vi.fn()}
        onSelect={vi.fn()}
        onStartDrag={vi.fn()}
        onToggleVisible={vi.fn()}
        openPickerIndex={null}
        paint={SOLID_PAINT}
        paintIndex={0}
        registerRow={vi.fn()}
        {...overrides}
      />
    </TestProviders>,
  );

describe('FillRow behaviors', () => {
  beforeEach(() => {
    contrastCheckerStateCache.current = DEFAULT_CONTRAST_CHECKER_STATE;
    usePatternThumbnailMock.mockClear();
  });

  afterEach(() => {
    store.dispatch(setImageEditor(null));
    store.dispatch(setImageFillPickerFocus(null));
  });

  it('should show the hex and opacity for a solid fill', () => {
    // before
    renderFillRow();

    // result
    expect(screen.getByDisplayValue('ff0000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
  });

  it('should commit an opacity change through onChange, preserving the rest of the paint', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderFillRow({ onChange });

    // action
    fireEvent.blur(screen.getByDisplayValue('80'), { target: { value: '50' } });

    // result
    expect(onChange).toHaveBeenCalledWith({ color: '#ff0000', opacity: 50, type: 'solid' });
  });

  it('should render the same reopenable color picker input for an image fill, not a dead-end static preview', () => {
    // mock
    const imagePaint: TPaint = { opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    // before
    const { container } = renderFillRow({ paint: imagePaint });

    // result
    expect(container.querySelector('[class*="FillImagePreview"]')).toBeNull();
    expect(screen.getByDisplayValue('Image')).toBeInTheDocument();
  });

  it('should advance an image fill by 90° through onChange when the rotate button is clicked', () => {
    // mock
    const onChange = vi.fn();
    const imagePaint: TPaint = { opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    // before
    renderFillRow({ onChange, paint: imagePaint });

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));
    fireEvent.click(screen.getByRole('button', { name: 'Rotate image' }));

    // result
    expect(onChange).toHaveBeenCalledWith({ ...imagePaint, rotation: 90 });
  });

  it('should render the picker already open when the fill-picker focus marker points at this exact row (restoring a picker hidden by the ImageCrop panel swap)', () => {
    // mock
    const imagePaint: TPaint = { opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    store.dispatch(setImageFillPickerFocus({ nodeId: 'node-1', paintIndex: 0 }));

    // before — no click on the swatch, yet the picker content shows up already
    renderFillRow({ openPickerIndex: 0, paint: imagePaint });

    // result
    expect(screen.getByRole('button', { name: 'Rotate image' })).toBeInTheDocument();
  });

  it('should not restore the picker for a row whose node/paintIndex does not match the focus marker', () => {
    // mock
    const imagePaint: TPaint = { opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    store.dispatch(setImageFillPickerFocus({ nodeId: 'node-1', paintIndex: 1 }));

    // before
    renderFillRow({ paint: imagePaint, paintIndex: 0 });

    // result
    expect(screen.queryByRole('button', { name: 'Rotate image' })).not.toBeInTheDocument();
  });

  it('should not re-arm the image editor purely from restoring the picker on mount, leaving it as the external close left it', () => {
    // mock
    const imagePaint: TPaint = { opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    store.dispatch(setImageFillPickerFocus({ nodeId: 'node-1', paintIndex: 0 }));

    // before
    renderFillRow({ openPickerIndex: 0, paint: imagePaint });

    // result — no canvas-facing crop/position session got (re)armed just from the picker reappearing
    expect(selectImageEditor(store.getState())).toBeNull();
  });

  it('should commit an empty-ref image paint (so the canvas can show a placeholder) when switching a solid fill to Image', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderFillRow({ onChange, paint: SOLID_PAINT });

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));
    fireEvent.click(screen.getByLabelText('Image'));

    // result
    expect(onChange).toHaveBeenCalledWith({ opacity: 80, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' });
  });

  it("should commit scaleMode 'fit' through onChange when Fit is picked from the fill-mode dropdown", () => {
    // mock
    const onChange = vi.fn();
    const imagePaint: TPaint = { opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    // before
    renderFillRow({ onChange, paint: imagePaint });

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));
    fireEvent.click(screen.getByText('Fill'));
    fireEvent.click(screen.getByText('Fit'));

    // result
    expect(onChange).toHaveBeenCalledWith({ ...imagePaint, scaleMode: 'fit' });
  });

  it('should commit a blend mode change through onChange, preserving the rest of the paint, when a blend mode is picked from the picker', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderFillRow({ onChange });

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));
    fireEvent.click(screen.getByLabelText('Apply blend mode to fill'));
    fireEvent.click(screen.getByText('Multiply', { exact: true }));

    // result
    expect(onChange).toHaveBeenCalledWith({ ...SOLID_PAINT, blendMode: BlendMode.multiply });
  });

  it("should carry a fill's blend mode across a paint type switch, from solid to image", () => {
    // mock
    const onChange = vi.fn();

    // before
    renderFillRow({ onChange, paint: { ...SOLID_PAINT, blendMode: BlendMode.multiply } });

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));
    fireEvent.click(screen.getByLabelText('Image'));

    // result
    expect(onChange).toHaveBeenCalledWith({
      blendMode: BlendMode.multiply,
      opacity: 80,
      ref: '',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    });
  });

  it('should show a contrast ratio against the page background when the contrast checker is toggled on a solid fill', () => {
    // before
    renderFillRow();

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));
    fireEvent.click(screen.getByLabelText('Check color contrast'));

    // result
    expect(screen.getByText(/^\d+\.\d{2} : 1$/)).toBeInTheDocument();
  });

  it('should say the foreground has a blend mode, instead of a ratio, when the fill has one', () => {
    // before
    renderFillRow({ paint: { ...SOLID_PAINT, blendMode: BlendMode.multiply } });

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));
    fireEvent.click(screen.getByLabelText('Check color contrast'));

    // result
    expect(screen.getByText('Foreground has blend mode')).toBeInTheDocument();
  });

  it('should not offer the contrast checker for a gradient fill, since contrast only applies to solid fills', () => {
    // before
    renderFillRow({
      paint: {
        end: { x: 1, y: 0.5 },
        opacity: 100,
        start: { x: 0, y: 0.5 },
        stops: [
          { color: '#ffffff', opacity: 100, position: 0 },
          { color: '#000000', opacity: 100, position: 1 },
        ],
        type: 'gradient-linear',
      },
    });

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));

    // result
    expect(screen.queryByLabelText('Check color contrast')).not.toBeInTheDocument();
  });

  it('should commit a hex change through onChange, preserving the rest of the paint', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderFillRow({ onChange });

    // action
    fireEvent.blur(screen.getByDisplayValue('ff0000'), { target: { value: '00ff00' } });

    // result
    expect(onChange).toHaveBeenCalledWith({ color: '#00ff00', opacity: 80, type: 'solid' });
  });

  it('should toggle visibility when the eye button is clicked', () => {
    // mock
    const onToggleVisible = vi.fn();

    // before
    renderFillRow({ onToggleVisible });

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Hide fill' }));

    // result
    expect(onToggleVisible).toHaveBeenCalled();
  });

  it('should show the "show" label when the fill is hidden', () => {
    // before
    renderFillRow({ paint: { ...SOLID_PAINT, visible: false } });

    // result
    expect(screen.getByRole('button', { name: 'Show fill' })).toBeInTheDocument();
  });

  it('should remove the row when the delete button is clicked', () => {
    // mock
    const onRemove = vi.fn();

    // before
    renderFillRow({ onRemove });

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Delete fill' }));

    // result
    expect(onRemove).toHaveBeenCalled();
  });

  it('should not throw and fall back to a default swatch color for a gradient fill with no stops yet', () => {
    // before / result
    expect(() =>
      renderFillRow({
        paint: { end: { x: 1, y: 0.5 }, opacity: 100, start: { x: 0, y: 0.5 }, stops: [], type: 'gradient-linear' },
      }),
    ).not.toThrow();
  });

  it('should show the gradient type label and the paint overall opacity for a gradient fill, in the same input as a solid fill', () => {
    // before
    renderFillRow({
      paint: {
        end: { x: 1, y: 0.5 },
        opacity: 40,
        start: { x: 0, y: 0.5 },
        stops: [
          { color: '#ffffff', opacity: 100, position: 0 },
          { color: '#000000', opacity: 100, position: 1 },
        ],
        type: 'gradient-linear',
      },
    });

    // result
    expect(screen.getByDisplayValue('Linear')).toBeInTheDocument();
    expect(screen.getByDisplayValue('40')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide fill' })).toBeInTheDocument();
  });

  it('should open a working gradient editor, defaulting to the Gradient tab, when the swatch is clicked', () => {
    // before
    renderFillRow({
      paint: {
        end: { x: 1, y: 0.5 },
        opacity: 100,
        start: { x: 0, y: 0.5 },
        stops: [
          { color: '#ffffff', opacity: 100, position: 0 },
          { color: '#000000', opacity: 100, position: 1 },
        ],
        type: 'gradient-linear',
      },
    });

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));

    // result
    expect(screen.getByRole('button', { name: 'Rotate gradient' })).toBeInTheDocument();
  });

  it('should start a drag from the handle', () => {
    // mock
    const onStartDrag = vi.fn();

    // before
    renderFillRow({ onStartDrag });

    // action
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Reorder fill' }));

    // result
    expect(onStartDrag).toHaveBeenCalled();
  });

  it('should select instead of dragging when the handle is pressed with a modifier held', () => {
    // mock
    const onSelect = vi.fn();
    const onStartDrag = vi.fn();

    // before
    renderFillRow({ onSelect, onStartDrag });

    // action
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Reorder fill' }), { metaKey: true });

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: false });
    expect(onStartDrag).not.toHaveBeenCalled();
  });

  it('should select the row on a plain click, forwarding the click modifiers', () => {
    // mock
    const onSelect = vi.fn();

    // before
    const { container } = renderFillRow({ onSelect });

    // action
    fireEvent.click(container.querySelector('[class*="FillRow_"]')!, { shiftKey: true });

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: false, shift: true });
  });

  it('should not select the row when clicking inside the color fields', () => {
    // mock
    const onSelect = vi.fn();

    // before
    renderFillRow({ onSelect });

    // action
    fireEvent.click(screen.getByDisplayValue('ff0000'));

    // result
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should apply the selected style when selected or dragging', () => {
    // before
    const { container } = renderFillRow({ isSelected: true });

    // result
    expect(container.querySelector('[class*="FillRow--selected"]')).toBeInTheDocument();
  });

  it('should highlight the row while its own color picker is open', () => {
    // before
    const { container } = renderFillRow();

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));

    // result
    expect(container.querySelector('[class*="FillRow--pickerOpen"]')).toBeInTheDocument();
  });

  it('should show the Solid paint type button once the color picker is open', () => {
    // before
    renderFillRow();

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));

    // result
    expect(screen.getByRole('button', { name: 'Solid' })).toBeInTheDocument();
  });

  it('should show the literal "Pattern" text and a backgroundless swatch with a center dot for a pattern fill, in the same input as a solid fill', () => {
    // before
    const { container } = renderFillRow({
      paint: {
        alignmentIndex: 0,
        direction: 'horizontal',
        offsetX: 0,
        offsetY: 0,
        opacity: 60,
        scale: 100,
        spacingX: 0,
        spacingY: 0,
        tileType: 'rectangular',
        type: 'pattern',
      },
    });

    // result
    expect(screen.getByDisplayValue('Pattern')).toBeInTheDocument();
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    expect(container.querySelector('[class*="Color__dot"]')).not.toBeNull();
    expect(container.querySelector('[style*="255, 255, 255"]')).not.toBeInTheDocument();
  });

  it("should pass the pattern paint's sourceNodeId down to the source preview once the picker is open", () => {
    // mock
    usePatternThumbnailMock.mockReturnValue(null);

    // before
    renderFillRow({
      paint: {
        alignmentIndex: 0,
        direction: 'horizontal',
        offsetX: 0,
        offsetY: 0,
        opacity: 60,
        scale: 100,
        sourceNodeId: 'source-node-1',
        spacingX: 0,
        spacingY: 0,
        tileType: 'rectangular',
        type: 'pattern',
      },
    });

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));

    // result
    expect(usePatternThumbnailMock).toHaveBeenCalledWith('source-node-1');
  });

  it('should never look up a pattern source thumbnail for a solid fill', () => {
    // before
    renderFillRow({ paint: SOLID_PAINT });

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));

    // result — a solid fill is never treated as having a pattern source, regardless of it being requested at mount
    expect(usePatternThumbnailMock).toHaveBeenCalledWith(null);
  });

  it('should keep the picker open and showing pattern content after clicking Pattern converts a solid fill mid-edit', async () => {
    // before — a controlled wrapper feeds onChange's committed paint back in as new props, the
    // same way the real Redux round-trip does, so paint.type genuinely flips while the picker is open
    render(
      <TestProviders>
        <ControlledFillRow initialPaint={SOLID_PAINT} />
      </TestProviders>,
    );

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));
    fireEvent.click(screen.getByRole('button', { name: 'Pattern' }));

    // result — the same still-open picker now shows the pattern content, it wasn't torn down and
    // replaced by a fresh, closed one when the underlying committed paint became a real pattern paint
    await waitFor(() => expect(screen.getByRole('button', { name: 'Select source...' })).toBeInTheDocument());
  });

  it('should keep the picker open and showing gradient content after clicking Gradient converts a solid fill mid-edit', async () => {
    // before — a controlled wrapper feeds onChange's committed paint back in as new props, the
    // same way the real Redux round-trip does, so paint.type genuinely flips while the picker is open
    render(
      <TestProviders>
        <ControlledFillRow initialPaint={SOLID_PAINT} />
      </TestProviders>,
    );

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));
    fireEvent.click(screen.getByRole('button', { name: 'Gradient' }));

    // result — the same still-open picker now shows gradient content, it wasn't torn down and
    // replaced by a fresh, closed one when the underlying committed paint became a real gradient
    await waitFor(() => expect(screen.getByRole('button', { name: 'Rotate gradient' })).toBeInTheDocument());
  });
});
