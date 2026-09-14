import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode, useState } from 'react';

// components
import FillRow from './FillRow';
import { TooltipProvider } from 'shared';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// store
import { store } from 'store';

// types
import { TPaint } from 'types/design/paint/types';

const TestProviders = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsContext.Provider value={createCanvasRefs()}>
      <TooltipProvider>{children}</TooltipProvider>
    </CanvasRefsContext.Provider>
  </Provider>
);

const SOLID_PAINT: TPaint = { color: '#ff0000', opacity: 80, type: 'solid' };

const ControlledFillRow = ({ initialPaint }: { initialPaint: TPaint }): ReturnType<typeof FillRow> => {
  const [paint, setPaint] = useState(initialPaint);

  return (
    <FillRow
      isDragging={false}
      isSelected={false}
      nodeId="node-1"
      onChange={setPaint}
      onDragEnd={vi.fn()}
      onDragStart={vi.fn()}
      onRemove={vi.fn()}
      onSelect={vi.fn()}
      onStartDrag={vi.fn()}
      onToggleVisible={vi.fn()}
      paint={paint}
      paintIndex={0}
      registerRow={vi.fn()}
    />
  );
};

const renderFillRow = (overrides: Partial<Parameters<typeof FillRow>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TestProviders>
      <FillRow
        isDragging={false}
        isSelected={false}
        nodeId="node-1"
        onChange={vi.fn()}
        onDragEnd={vi.fn()}
        onDragStart={vi.fn()}
        onRemove={vi.fn()}
        onSelect={vi.fn()}
        onStartDrag={vi.fn()}
        onToggleVisible={vi.fn()}
        paint={SOLID_PAINT}
        paintIndex={0}
        registerRow={vi.fn()}
        {...overrides}
      />
    </TestProviders>,
  );

describe('FillRow behaviors', () => {
  it('should show the hex and opacity for a solid fill', () => {
    // before
    renderFillRow();

    // result
    expect(screen.getByDisplayValue('ff0000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
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
