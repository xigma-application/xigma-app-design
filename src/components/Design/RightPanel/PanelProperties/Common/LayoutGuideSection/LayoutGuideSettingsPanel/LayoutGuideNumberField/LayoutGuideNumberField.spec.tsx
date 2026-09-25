import { render } from '@testing-library/react';

// components
import LayoutGuideNumberField from './LayoutGuideNumberField';
import { fieldProps } from 'test/FieldMock';

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return { ...original, UITools: { ...original.UITools, Field: FieldMock } };
});

describe('LayoutGuideNumberField behaviors', () => {
  it('should show the value with its unit and a scrubbable edge', () => {
    // mock
    const onBlur = vi.fn();

    // before
    render(<LayoutGuideNumberField ariaLabel="Size" label="Size" min={1} onBlur={onBlur} onScrub={vi.fn()} unit="px" value={8} />);

    // result
    expect(fieldProps.at(-1)).toMatchObject({
      'aria-label': 'Size',
      defaultValue: '8px',
      disabled: false,
      onBlur,
      stepNumbers: { max: Number.POSITIVE_INFINITY, min: 1 },
    });
    expect(fieldProps.at(-1)?.startAdornment).toBeTruthy();
  });

  it('should show an empty field without a scrubbable edge when disabled', () => {
    // before
    render(
      <LayoutGuideNumberField
        ariaLabel="Size"
        disabled
        isMixed
        label="Size"
        max={10}
        min={1}
        onBlur={vi.fn()}
        onScrub={vi.fn()}
        placeholder="Auto"
        value={8}
      />,
    );

    // result
    expect(fieldProps.at(-1)).toMatchObject({
      defaultValue: '',
      disabled: true,
      placeholder: 'Auto',
      startAdornment: false,
      stepNumbers: { max: 10, min: 1 },
    });
  });
});
