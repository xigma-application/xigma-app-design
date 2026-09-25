import { render } from '@testing-library/react';

// components
import LayoutGuideGridFields from './LayoutGuideGridFields';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { LayoutGuideType } from 'types/design/enums';
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

const renderFields = (mixedKeys: (keyof TLayoutGuide)[]): Record<string, TFunc> => {
  const handlers = {
    onBlur: vi.fn(() => vi.fn()),
    onCommitAlpha: vi.fn(),
    onCommitHex: vi.fn(),
    onDragEnd: vi.fn(),
    onDragStart: vi.fn(),
    onPickerChange: vi.fn(),
    onScrub: vi.fn(() => vi.fn()),
  };

  render(<LayoutGuideGridFields {...handlers} guide={createLayoutGuide(LayoutGuideType.grid)} mixedKeys={new Set(mixedKeys)} />);

  return handlers;
};

describe('LayoutGuideGridFields behaviors', () => {
  it('should show the size and color of the grid', () => {
    // before
    const { onBlur, onScrub } = renderFields([]);

    // result
    expect(childProps.number.at(-1)?.isMixed).toBe(false);
    expect(childProps.color.at(-1)).toMatchObject({ alphaDisplayValue: undefined, hexDisplayValue: undefined, label: 'Color' });
    expect(onBlur).toHaveBeenCalledWith('size', 1);
    expect(onScrub).toHaveBeenCalledWith('size', 1);
  });

  it('should show Mixed for differing values', () => {
    // before
    renderFields(['size', 'opacity', 'color']);

    // result
    expect(childProps.number.at(-1)?.isMixed).toBe(true);
    expect(childProps.color.at(-1)).toMatchObject({ alphaDisplayValue: MIXED_LABEL, hexDisplayValue: MIXED_LABEL });
  });
});
