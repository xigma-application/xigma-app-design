import { render, screen } from '@testing-library/react';

// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// components
import StrokeBrushCategorySection from './StrokeBrushCategorySection';

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

vi.mock('./StrokeBrushOption/StrokeBrushOption', () => ({ default: recordAs('option') }));
vi.mock('./hooks/useIsHeaderStuck/useIsHeaderStuck', () => ({ useIsHeaderStuck: (): boolean => true }));

const category = BRUSH_CATEGORIES[0];

describe('StrokeBrushCategorySection behaviors', () => {
  it('should show the category header and an option per brush wired to its id', () => {
    // mock
    const handlers = { onHoverEnd: vi.fn(), onHoverStart: vi.fn(), onSelect: vi.fn() };
    const [first] = category.brushes;

    // before
    const { container } = render(
      <StrokeBrushCategorySection
        {...handlers}
        category={category}
        getBrushLabel={(key): string => `brush:${key}`}
        getCategoryLabel={(key): string => `category:${key}`}
        selectedBrushId={first.id}
      />,
    );

    // action
    (childProps.option[0].onClick as TFunc)();
    (childProps.option[0].onMouseEnter as TFunc)();

    // result
    expect(screen.getByText(`category:${category.labelTranslationKey}`)).toBeInTheDocument();
    expect(((container.firstChild as HTMLElement).firstChild as HTMLElement).className).toMatch(/stuck/);
    expect(childProps.option).toHaveLength(category.brushes.length);
    expect(childProps.option[0]).toMatchObject({
      label: `brush:${first.labelTranslationKey}`,
      onMouseLeave: handlers.onHoverEnd,
      selected: true,
    });
    expect(handlers.onSelect).toHaveBeenCalledWith(first.id);
    expect(handlers.onHoverStart).toHaveBeenCalledWith(first.id);
  });
});
