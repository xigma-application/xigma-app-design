import { render } from '@testing-library/react';

// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// components
import StrokeBrushPicker from './StrokeBrushPicker';

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

vi.mock('./StrokeBrushCategorySection/StrokeBrushCategorySection', () => ({ default: recordAs('category') }));
vi.mock('../../StrokeSettingsPanelHeader/StrokeSettingsPanelHeader', () => ({ default: recordAs('header') }));

describe('StrokeBrushPicker behaviors', () => {
  it('should show a titled header and a section per brush category', () => {
    // mock
    const handlers = { onClose: vi.fn(), onOptionHoverEnd: vi.fn(), onOptionHoverStart: vi.fn(), onSelect: vi.fn() };

    // before
    render(<StrokeBrushPicker {...handlers} selectedBrushId="b" />);

    // find
    const section = childProps.category[0];

    // result
    expect(childProps.header.at(-1)).toMatchObject({ onClose: handlers.onClose });
    expect(childProps.header.at(-1)?.title).toEqual(expect.any(String));
    expect(childProps.category).toHaveLength(BRUSH_CATEGORIES.length);
    expect(section).toMatchObject({
      onHoverEnd: handlers.onOptionHoverEnd,
      onHoverStart: handlers.onOptionHoverStart,
      onSelect: handlers.onSelect,
      selectedBrushId: 'b',
    });
    expect((section.getBrushLabel as TFunc<[string], string>)('common.close')).toBe('Close');
    expect((section.getCategoryLabel as TFunc<[string], string>)('common.close')).toBe('Close');
  });
});
