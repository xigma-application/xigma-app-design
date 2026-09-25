import { render, screen } from '@testing-library/react';

// components
import LayoutGuideSection from './LayoutGuideSection';
import { TooltipProvider } from 'shared';

// types
import { LayoutGuideType } from 'types/design/enums';

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

const section = {
  containerRef: { current: null },
  dropIndicatorOffset: null as number | null,
  getMixedKeys: vi.fn(() => new Set()),
  guides: [createLayoutGuide(LayoutGuideType.grid), createLayoutGuide(LayoutGuideType.columns)],
  isHidden: vi.fn(() => false),
  isMixed: false,
  isRowDragging: vi.fn(() => false),
  isRowSelected: vi.fn(() => false),
  isStretchedOnAny: vi.fn(() => false),
  onAdd: vi.fn(),
  onChange: vi.fn(),
  onDragEnd: vi.fn(),
  onDragStart: vi.fn(),
  onFieldScrub: vi.fn(),
  onOpenChange: vi.fn(),
  onRemove: vi.fn(),
  onSelectRow: vi.fn(),
  onStartDrag: vi.fn(),
  onToggleVisible: vi.fn(),
  openIndex: 1 as number | null,
  registerRow: vi.fn(() => vi.fn()),
};

vi.mock('./hooks/useLayoutGuideSection/useLayoutGuideSection', () => ({ useLayoutGuideSection: (): unknown => section }));
vi.mock('./LayoutGuideRow/LayoutGuideRow', () => ({ default: recordAs('row') }));
vi.mock('../FillSection/FillDropIndicator/FillDropIndicator', () => ({ default: recordAs('drop') }));

const renderSection = (): void => {
  render(
    <TooltipProvider>
      <LayoutGuideSection />
    </TooltipProvider>,
  );
};

describe('LayoutGuideSection behaviors', () => {
  it('should render a draggable row per guide and route each row action with its index', () => {
    // before
    renderSection();

    // find
    const row = childProps.row.at(-1) as Record<string, TFunc<unknown[]>>;

    // action
    row.onChange({ count: 3 });
    row.onFieldScrub('count', 1, 5);
    row.onOpenChange(false);
    row.onRemove();
    row.onSelect();
    row.onStartDrag('event');
    row.onToggleVisible();

    // result
    expect(childProps.row.slice(-2).map(({ canDrag, isOpen }) => [canDrag, isOpen])).toEqual([
      [true, false],
      [true, true],
    ]);
    expect(section.onChange).toHaveBeenCalledWith(1, { count: 3 });
    expect(section.onFieldScrub).toHaveBeenCalledWith(1, 'count', 1, 5);
    expect(section.onOpenChange).toHaveBeenCalledWith(1, false);
    expect(section.onRemove).toHaveBeenCalledWith(1);
    expect(section.onSelectRow).toHaveBeenCalledWith(1);
    expect(section.onStartDrag).toHaveBeenCalledWith(1, 'event');
    expect(section.onToggleVisible).toHaveBeenCalledWith(1);
    expect(childProps.drop).toBeUndefined();
  });

  it('should show the mixed hint and the drop indicator without guides', () => {
    // mock
    section.isMixed = true;
    section.dropIndicatorOffset = 12;
    section.guides = [];

    // before
    renderSection();

    // result
    expect(screen.getByText('Click + to replace mixed content')).toBeInTheDocument();
    expect(childProps.drop.at(-1)?.offset).toBe(12);
  });
});
