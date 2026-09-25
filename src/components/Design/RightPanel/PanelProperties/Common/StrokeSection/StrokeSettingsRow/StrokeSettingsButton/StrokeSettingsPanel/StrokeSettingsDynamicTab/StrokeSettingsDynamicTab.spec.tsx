import { render } from '@testing-library/react';

// components
import StrokeSettingsDynamicTab from './StrokeSettingsDynamicTab';
import { fieldProps } from 'test/FieldMock';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

const onBlur = vi.fn(() => vi.fn());

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return { ...original, UITools: { ...original.UITools, Field: FieldMock } };
});
vi.mock('./hooks/useStrokeSettingsDynamicTab/useStrokeSettingsDynamicTab', () => ({
  useStrokeSettingsDynamicTab: (): unknown => ({ onBlur, values: { frequency: 20, smoothen: 5, wiggle: undefined } }),
}));

describe('StrokeSettingsDynamicTab behaviors', () => {
  it('should show a percentage field per dynamic setting, with Mixed for a differing one', () => {
    // before
    render(<StrokeSettingsDynamicTab />);

    // result
    expect(fieldProps.slice(-3).map(({ defaultValue, e2eValue }) => [e2eValue, defaultValue])).toEqual([
      ['stroke-frequency', '20%'],
      ['stroke-wiggle', MIXED_LABEL],
      ['stroke-smoothen', '5%'],
    ]);
    expect(onBlur.mock.calls).toEqual([['frequency'], ['wiggle'], ['smoothen']]);
  });
});
