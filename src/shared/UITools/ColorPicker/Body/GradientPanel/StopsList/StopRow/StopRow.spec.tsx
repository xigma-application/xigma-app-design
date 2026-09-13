import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode, useState } from 'react';

// components
import StopRow from './StopRow';
import { TooltipProvider } from 'shared';

// others
import { DockedPanelContext } from '../../../../DockedPanelContext';

// types
import { TEditableGradientStop } from '../../types';

const STOP: TEditableGradientStop = { color: '#ff0000', id: 'stop-1', opacity: 80, position: 0.5 };

const DockedPanelHost = ({ children }: { children: ReactNode }): ReactNode => {
  const [dockedPanel, setDockedPanel] = useState<ReactNode>(null);

  return (
    <DockedPanelContext.Provider value={setDockedPanel}>
      {children}
      {dockedPanel}
    </DockedPanelContext.Provider>
  );
};

const renderStopRow = (overrides: Partial<Parameters<typeof StopRow>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <DockedPanelHost>
        <StopRow
          canRemove
          isSelected={false}
          onColorChange={vi.fn()}
          onPositionChange={vi.fn()}
          onRemove={vi.fn()}
          onSelect={vi.fn()}
          stop={STOP}
          {...overrides}
        />
      </DockedPanelHost>
    </TooltipProvider>,
  );

describe('StopRow behaviors', () => {
  it('should show the stop position, hex, and opacity', () => {
    // before
    renderStopRow();

    // result
    expect(screen.getByDisplayValue('50%')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ff0000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
  });

  it('should opt out of the moveable popover drag-to-move handling', () => {
    // before
    const { container } = renderStopRow();

    // result
    expect(container.querySelector('[data-no-drag]')).toBeInTheDocument();
  });

  it('should select the stop when the row is clicked', () => {
    // mock
    const onSelect = vi.fn();

    // before
    renderStopRow({ onSelect });

    // action
    fireEvent.click(screen.getByDisplayValue('ff0000'));

    // result
    expect(onSelect).toHaveBeenCalled();
  });

  it('should open a docked color panel when the swatch is clicked, instead of a floating popover', () => {
    // before
    renderStopRow();

    // action
    fireEvent.click(screen.getByLabelText('Stop color'));

    // result — the docked panel keeps its own Custom/Libraries header, but it's not a full nested
    // ColorPicker popover: no Solid/Gradient tab (only shown by the non-simple default header)
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.queryByText('Solid')).not.toBeInTheDocument();
    expect(screen.getAllByDisplayValue('ff0000')).toHaveLength(2);
  });

  it('should close the docked color panel when its close button is clicked', () => {
    // before
    renderStopRow();

    fireEvent.click(screen.getByLabelText('Stop color'));

    expect(screen.getAllByDisplayValue('ff0000')).toHaveLength(2);

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(screen.getAllByDisplayValue('ff0000')).toHaveLength(1);
  });

  it('should report a position change from the position field', () => {
    // mock
    const onPositionChange = vi.fn();

    // before
    renderStopRow({ onPositionChange });
    const input = screen.getByLabelText('Stop position');

    // action
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.blur(input);

    // result
    expect(onPositionChange).toHaveBeenCalledWith(0.1);
  });

  it('should report a color change from the hex field', () => {
    // mock
    const onColorChange = vi.fn();

    // before
    renderStopRow({ onColorChange });
    const input = screen.getByDisplayValue('ff0000');

    // action
    fireEvent.change(input, { target: { value: '00ff00' } });
    fireEvent.blur(input);

    // result
    expect(onColorChange).toHaveBeenCalledWith({ alpha: 80, hex: '#00ff00' });
  });

  it('should report an opacity change from the alpha field', () => {
    // mock
    const onColorChange = vi.fn();

    // before
    renderStopRow({ onColorChange });
    const input = screen.getByDisplayValue('80');

    // action
    fireEvent.change(input, { target: { value: '30' } });
    fireEvent.blur(input);

    // result
    expect(onColorChange).toHaveBeenCalledWith({ alpha: 30, hex: '#ff0000' });
  });

  it('should call onRemove when the remove button is clicked', () => {
    // mock
    const onRemove = vi.fn();

    // before
    renderStopRow({ onRemove });

    // action
    fireEvent.click(screen.getByLabelText('Remove stop'));

    // result
    expect(onRemove).toHaveBeenCalled();
  });

  it('should disable the remove button when canRemove is false', () => {
    // before
    renderStopRow({ canRemove: false });

    // result
    expect(screen.getByLabelText('Remove stop')).toBeDisabled();
  });

  it('should show the remove tooltip on focus', async () => {
    // before
    renderStopRow();

    // action
    fireEvent.focus(screen.getByLabelText('Remove stop'));

    // result
    expect(await screen.findAllByText('Remove stop', {}, { timeout: 2000 })).not.toHaveLength(0);
  });
});
