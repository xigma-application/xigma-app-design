import { render } from '@testing-library/react';

// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// components
import StrokeSettingsBrushTab from './StrokeSettingsBrushTab';
import { fieldProps } from 'test/FieldMock';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

const { childProps, recordAs } = vi.hoisted(() => {
  const recorded: Record<string, Record<string, unknown>[]> = {};

  return {
    childProps: recorded,
    recordAs:
      (name: string) =>
      (props: Record<string, unknown>): null => {
        recorded[name] = [...(recorded[name] ?? []), props];
        return null;
      },
  };
});

const brushTab = {
  brush: undefined as string | undefined,
  direction: undefined as string | undefined,
  isDirectionBrush: false,
  isScatterBrush: false,
  onBrushCommit: vi.fn(),
  onBrushPreview: vi.fn(),
  onBrushRevert: vi.fn(),
  onDirectionChange: vi.fn(),
  onScatterBlur: vi.fn(),
  scatterValues: {},
};
const picker = { isPickerOpen: true, onTogglePicker: vi.fn(), triggerRef: { current: null } };

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return { ...original, UITools: { ...original.UITools, Field: FieldMock } };
});
vi.mock('./hooks/useStrokeSettingsBrushTab/useStrokeSettingsBrushTab', () => ({ useStrokeSettingsBrushTab: (): unknown => brushTab }));
vi.mock('./hooks/useStrokeBrushPicker', () => ({ useStrokeBrushPicker: (): unknown => picker }));
vi.mock('./StrokeBrushTrigger/StrokeBrushTrigger', () => ({ default: recordAs('trigger') }));
vi.mock('./StrokeScatterBrushFields/StrokeScatterBrushFields', () => ({ default: recordAs('scatter') }));
vi.mock('../StrokeSettingsWidthProfileField/StrokeSettingsWidthProfileField', () => ({ default: recordAs('width') }));

describe('StrokeSettingsBrushTab behaviors', () => {
  it('should show Mixed in the brush trigger and only the width profile for a mixed brush', () => {
    // before
    render(<StrokeSettingsBrushTab />);

    // result
    expect(childProps.trigger.at(-1)).toMatchObject({
      brushId: undefined,
      brushLabel: MIXED_LABEL,
      isOpen: true,
      onClick: picker.onTogglePicker,
    });
    expect(childProps.scatter).toBeUndefined();
    expect(childProps.width).toHaveLength(1);
    expect(fieldProps).toHaveLength(0);
  });

  it('should show the scatter fields and the direction toggle for a scatter direction brush', () => {
    // mock
    const brush = BRUSH_CATEGORIES[0].brushes[0];
    Object.assign(brushTab, { brush: brush.id, direction: 'left', isDirectionBrush: true, isScatterBrush: true });

    // before
    render(<StrokeSettingsBrushTab />);

    // result
    expect(childProps.trigger.at(-1)?.brushLabel).not.toBe(MIXED_LABEL);
    expect(childProps.scatter.at(-1)).toMatchObject({ onBlur: brushTab.onScatterBlur, values: brushTab.scatterValues });
    expect(fieldProps.at(-1)).toMatchObject({ onChange: brushTab.onDirectionChange, value: 'left' });
  });

  it('should mark no direction for a mixed direction', () => {
    // mock
    Object.assign(brushTab, { direction: undefined, isDirectionBrush: true });

    // before
    render(<StrokeSettingsBrushTab />);

    // result
    expect(fieldProps.at(-1)?.value).toBe('');
  });
});
