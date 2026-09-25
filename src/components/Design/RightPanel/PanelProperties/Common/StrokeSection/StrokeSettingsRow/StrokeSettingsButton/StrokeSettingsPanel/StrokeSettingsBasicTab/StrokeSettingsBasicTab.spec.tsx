import { render } from '@testing-library/react';

// components
import StrokeSettingsBasicTab from './StrokeSettingsBasicTab';
import { fieldProps } from 'test/FieldMock';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { StrokeDashCap, StrokeJoin, StrokeStyle } from 'types/design/enums';

const { basicTab, widthProps } = vi.hoisted(() => ({
  basicTab: {} as Record<string, unknown>,
  widthProps: [] as Record<string, unknown>[],
}));

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return { ...original, UITools: { ...original.UITools, Field: FieldMock } };
});
vi.mock('./hooks/useStrokeSettingsBasicTab/useStrokeSettingsBasicTab', () => ({ useStrokeSettingsBasicTab: (): unknown => basicTab }));
vi.mock('../StrokeSettingsWidthProfileField/StrokeSettingsWidthProfileField', () => ({
  default: (props: Record<string, unknown>): null => {
    widthProps.push(props);
    return null;
  },
}));

const HANDLERS = {
  onDashBlur: vi.fn(),
  onDashCapSelect: vi.fn(),
  onDashScrub: vi.fn(),
  onDashStep: vi.fn(),
  onDashesBlur: vi.fn(),
  onDashesScrub: vi.fn(),
  onDashesStep: vi.fn(),
  onGapBlur: vi.fn(),
  onGapScrub: vi.fn(),
  onGapStep: vi.fn(),
  onJoinSelect: vi.fn(),
  onMiterAngleBlur: vi.fn(),
  onMiterAngleDragEnd: vi.fn(),
  onMiterAngleDragStart: vi.fn(),
  onMiterAngleScrub: vi.fn(),
  onMiterAngleStep: vi.fn(),
  onScrubDragEnd: vi.fn(),
  onScrubDragStart: vi.fn(),
  onStyleSelect: vi.fn(),
};

const renderTab = (values: Record<string, unknown>): Record<string, unknown>[] => {
  Object.assign(basicTab, HANDLERS, { hasJoin: true }, values);
  const before = fieldProps.length;

  render(<StrokeSettingsBasicTab />);

  return fieldProps.slice(before);
};

describe('StrokeSettingsBasicTab behaviors', () => {
  it('should show every setting of a dashed custom miter stroke with its values', () => {
    // before
    const fields = renderTab({
      dash: 4,
      dashCap: StrokeDashCap.round,
      dashes: [4, 2],
      gap: 2,
      hasDashes: true,
      isCustom: true,
      isDashed: true,
      isMiter: true,
      isWidthProfileDisabled: true,
      join: StrokeJoin.miter,
      miterAngle: 28,
      scrubValues: { dash: 4, dashes: [4, 2], gap: 2, miterAngle: 28 },
      style: StrokeStyle.dashed,
    });

    // result
    expect(fields.map(({ defaultValue, value }) => defaultValue ?? value)).toEqual([
      StrokeStyle.dashed,
      '4',
      '2',
      '4, 2',
      StrokeDashCap.round,
      StrokeJoin.miter,
      '28°',
    ]);
    expect(fields[0]).toMatchObject({ icon: expect.any(String), onSelect: HANDLERS.onStyleSelect, placeholder: MIXED_LABEL });
    expect(fields[1]).toMatchObject({ e2eValue: 'stroke-dash', onBlur: HANDLERS.onDashBlur });
    expect(fields[4]).toMatchObject({ onChange: HANDLERS.onDashCapSelect });
    expect(widthProps.at(-1)).toEqual({ disabled: true });
  });

  it('should show Mixed for every differing setting', () => {
    // before
    const fields = renderTab({
      dash: undefined,
      dashCap: undefined,
      dashes: undefined,
      gap: undefined,
      join: undefined,
      miterAngle: undefined,
      scrubValues: { dash: 0, dashes: [], gap: 0, miterAngle: 0 },
      style: undefined,
    });

    // result
    expect(fields.map(({ defaultValue, value }) => defaultValue ?? value)).toEqual([
      undefined,
      MIXED_LABEL,
      MIXED_LABEL,
      MIXED_LABEL,
      '',
      '',
      MIXED_LABEL,
    ]);
    expect(fields[0].icon).toBeUndefined();
  });

  it('should show only the style, width profile and join of a plain solid stroke', () => {
    // before
    const fields = renderTab({
      hasDashes: false,
      isCustom: false,
      isDashed: false,
      isMiter: false,
      isWidthProfileDisabled: false,
      join: StrokeJoin.round,
      style: StrokeStyle.solid,
    });

    // result
    expect(fields).toHaveLength(2);
    expect(fields[1].value).toBe(StrokeJoin.round);
    expect(widthProps.at(-1)).toEqual({ disabled: false });
  });

  it('should hide the join and miter angle for lines only', () => {
    // before
    const fields = renderTab({
      hasDashes: false,
      hasJoin: false,
      isCustom: false,
      isDashed: false,
      isMiter: true,
      isWidthProfileDisabled: false,
      join: StrokeJoin.miter,
      style: StrokeStyle.solid,
    });

    // result
    expect(fields).toHaveLength(1);
  });
});
