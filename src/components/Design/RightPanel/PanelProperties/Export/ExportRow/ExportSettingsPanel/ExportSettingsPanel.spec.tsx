import { ReactElement, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import ExportSettingsPanel from './ExportSettingsPanel';

// types
import { ExportFormat } from '../../enums';
import { TExportSetting } from '../../types';

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();

  return {
    ...original,
    Tooltip: ({ children }: { children: ReactNode }): ReactNode => children,
    UITools: {
      ...original.UITools,
      ButtonIcon: ({ ariaLabel, onClick }: { ariaLabel: string; onClick?: TFunc }): ReactElement => (
        <button aria-label={ariaLabel} onClick={onClick} type="button" />
      ),
      Field: ({
        label,
        onBlur,
        onChange,
        onSelect,
      }: {
        label: string;
        onBlur?: TFunc<[unknown]>;
        onChange?: TFunc<[unknown]>;
        onSelect?: TFunc<[unknown]>;
      }): ReactElement => (
        <button
          onClick={(): void => {
            onBlur?.({ target: { value: '@2x' } });
            onChange?.(true);
            onSelect?.('picked');
          }}
          type="button"
        >
          {label}
        </button>
      ),
    },
  };
});

const setting = (format: ExportFormat): TExportSetting => ({ format, suffix: '' }) as TExportSetting;

describe('ExportSettingsPanel behaviors', () => {
  it('should update every setting of an SVG export, including its SVG-only options', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<ExportSettingsPanel onChange={onChange} onClose={vi.fn()} setting={setting(ExportFormat.svg)} />);

    // action
    screen
      .getAllByRole('button')
      .slice(1)
      .forEach((field) => fireEvent.click(field));

    // result
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ suffix: '@2x' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ colorProfile: 'picked' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ imageResampling: 'picked' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ ignoreOverlappingLayers: true }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ includeBoundingBox: true }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ outlineText: true }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ includeIdAttribute: true }));
    expect(onChange).not.toHaveBeenCalledWith(expect.objectContaining({ quality: 'picked' }));
  });

  it('should offer quality and outlined text for a PDF export, but no id attribute', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<ExportSettingsPanel onChange={onChange} onClose={vi.fn()} setting={setting(ExportFormat.pdf)} />);

    // action
    screen
      .getAllByRole('button')
      .slice(1)
      .forEach((field) => fireEvent.click(field));

    // result
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ quality: 'picked' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ outlineText: true }));
    expect(onChange).not.toHaveBeenCalledWith(expect.objectContaining({ includeIdAttribute: true }));
  });

  it('should offer quality for a JPEG export only, and close from the header', () => {
    // mock
    const onClose = vi.fn();

    // before
    const { rerender } = render(<ExportSettingsPanel onChange={vi.fn()} onClose={onClose} setting={setting(ExportFormat.jpeg)} />);
    const jpegFields = screen.getAllByRole('button').length;
    rerender(<ExportSettingsPanel onChange={vi.fn()} onClose={onClose} setting={setting(ExportFormat.png)} />);

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(screen.getAllByRole('button').length).toBe(jpegFields - 1);
    expect(onClose).toHaveBeenCalled();
  });
});
