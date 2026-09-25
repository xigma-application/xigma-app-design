import { render, screen } from '@testing-library/react';

// components
import StrokeSettingsWidthProfileField from './StrokeSettingsWidthProfileField';
import { fieldProps } from 'test/FieldMock';

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return { ...original, UITools: { ...original.UITools, Field: FieldMock } };
});

describe('StrokeSettingsWidthProfileField behaviors', () => {
  it('should show the width profile control, enabled by default', () => {
    // before
    render(<StrokeSettingsWidthProfileField />);

    // result
    expect(screen.getByText('Width profile')).toBeInTheDocument();
    expect(fieldProps.at(-1)).toMatchObject({ controlWidth: 128, disabled: false });
  });

  it('should pass the disabled state', () => {
    // before
    render(<StrokeSettingsWidthProfileField disabled />);

    // result
    expect(fieldProps.at(-1)?.disabled).toBe(true);
  });
});
