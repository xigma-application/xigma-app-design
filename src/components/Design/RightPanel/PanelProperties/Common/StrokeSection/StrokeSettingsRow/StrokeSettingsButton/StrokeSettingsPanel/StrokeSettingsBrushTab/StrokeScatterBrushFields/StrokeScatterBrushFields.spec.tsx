import { render } from '@testing-library/react';

// components
import StrokeScatterBrushFields from './StrokeScatterBrushFields';
import { fieldProps } from 'test/FieldMock';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return { ...original, UITools: { ...original.UITools, Field: FieldMock } };
});

describe('StrokeScatterBrushFields behaviors', () => {
  it('should show a field per scatter setting with its unit, Mixed for a differing one and an icon where it has one', () => {
    // mock
    const onBlur = vi.fn<(field: string) => TFunc>(() => vi.fn());

    // before
    render(
      <StrokeScatterBrushFields onBlur={onBlur} values={{ angularJitter: 10, gap: undefined, rotation: 45, sizeJitter: 0, wiggle: 3 }} />,
    );

    // find
    const fields = fieldProps.slice(-5);

    // result
    expect(fields.map(({ e2eValue }) => e2eValue)).toEqual([
      'stroke-brush-gap',
      'stroke-brush-wiggle',
      'stroke-brush-sizeJitter',
      'stroke-brush-angularJitter',
      'stroke-brush-rotation',
    ]);
    expect(fields[0]).toMatchObject({ defaultValue: MIXED_LABEL, startAdornment: undefined });
    expect(fields[4].defaultValue).toMatch(/^45/);
    expect(fields[4].startAdornment).toBeTruthy();
    expect(onBlur.mock.calls.map(([field]) => field)).toEqual(['gap', 'wiggle', 'sizeJitter', 'angularJitter', 'rotation']);
  });
});
