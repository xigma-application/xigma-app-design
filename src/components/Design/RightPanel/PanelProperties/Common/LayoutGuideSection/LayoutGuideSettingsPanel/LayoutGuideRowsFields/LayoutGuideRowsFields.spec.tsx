import { render } from '@testing-library/react';

// components
import LayoutGuideRowsFields from './LayoutGuideRowsFields';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { LayoutGuideRowsAlign, LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';

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

vi.mock('../../../EffectsSection/EffectSettingsPanel/EffectColorField/EffectColorField', () => ({ default: recordAs('color') }));
vi.mock('../LayoutGuideNumberField/LayoutGuideNumberField', () => ({ default: recordAs('number') }));
vi.mock('../LayoutGuideAlignField/LayoutGuideAlignField', () => ({ default: recordAs('align') }));

const renderFields = (mixedKeys: (keyof TLayoutGuide)[], isStretchedOnAny?: boolean): Record<string, TFunc> => {
  const handlers = {
    onBlur: vi.fn(() => vi.fn()),
    onChange: vi.fn(),
    onCommitAlpha: vi.fn(),
    onCommitHex: vi.fn(),
    onDragEnd: vi.fn(),
    onDragStart: vi.fn(),
    onPickerChange: vi.fn(),
    onScrub: vi.fn(() => vi.fn()),
  };

  render(
    <LayoutGuideRowsFields
      {...handlers}
      guide={createLayoutGuide(LayoutGuideType.rows)}
      isStretchedOnAny={isStretchedOnAny}
      mixedKeys={new Set(mixedKeys)}
    />,
  );

  return handlers;
};

describe('LayoutGuideRowsFields behaviors', () => {
  it('should show the count, color, type, height, margin and gutter of the guide', () => {
    // before
    const { onBlur, onChange, onScrub } = renderFields([]);

    // action
    (childProps.align.at(-1)!.onSelect as TFunc<[string]>)(LayoutGuideRowsAlign.top);

    // result
    expect(onChange).toHaveBeenCalledWith({ rowsAlign: LayoutGuideRowsAlign.top });
    expect(childProps.align.at(-1)?.value).toBe(LayoutGuideRowsAlign.stretch);
    expect((childProps.align.at(-1)!.options as unknown[]).length).toBe(4);
    expect(childProps.color.at(-1)).toMatchObject({ alphaDisplayValue: undefined, hexDisplayValue: undefined, label: 'Color' });
    expect(childProps.number.slice(-4).map(({ disabled, isMixed }) => [disabled, isMixed])).toEqual([
      [undefined, false],
      [false, false],
      [undefined, false],
      [undefined, false],
    ]);
    expect(vi.mocked(onBlur).mock.calls).toEqual([
      ['count', 1],
      ['height', 1],
      ['margin', 0],
      ['gutter', 0],
    ]);
    expect(vi.mocked(onScrub).mock.calls).toEqual([
      ['count', 1],
      ['height', 1],
      ['margin', 0],
      ['gutter', 0],
    ]);
  });

  it('should show Mixed for differing values and disable the height of a stretched guide', () => {
    // before
    renderFields(['count', 'opacity', 'color', 'rowsAlign', 'height', 'margin', 'gutter'], true);

    // result
    expect(childProps.align.at(-1)?.value).toBeUndefined();
    expect(childProps.color.at(-1)).toMatchObject({ alphaDisplayValue: MIXED_LABEL, hexDisplayValue: MIXED_LABEL });
    expect(childProps.number.slice(-4).map(({ disabled, isMixed }) => [disabled, isMixed])).toEqual([
      [undefined, true],
      [true, true],
      [undefined, true],
      [undefined, true],
    ]);
  });
});
