import { render } from '@testing-library/react';

// components
import EffectColorField from './EffectColorField';
import { fieldProps } from 'test/FieldMock';

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return { ...original, UITools: { ...original.UITools, Field: FieldMock } };
});

describe('EffectColorField behaviors', () => {
  it('should pass the color and its handlers to a simple color picker field', () => {
    // mock
    const handlers = { onCommitAlpha: vi.fn(), onCommitHex: vi.fn(), onDragEnd: vi.fn(), onDragStart: vi.fn(), onPickerChange: vi.fn() };

    // before
    render(<EffectColorField {...handlers} alpha={50} e2eValue="effect-color" hex="#112233" label="Color" triggerAriaLabel="Pick color" />);

    // result
    expect(fieldProps.at(-1)).toMatchObject({
      ...handlers,
      alpha: 50,
      hex: '#112233',
      label: 'Color',
      simple: true,
      triggerAriaLabel: 'Pick color',
    });
  });
});
