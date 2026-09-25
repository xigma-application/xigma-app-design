import { render } from '@testing-library/react';

// components
import LayoutGuideSettingsPanel from './LayoutGuideSettingsPanel';

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

const panel = { onBlur: vi.fn(), onCommitAlpha: vi.fn(), onCommitHex: vi.fn(), onPickerChange: vi.fn(), onScrub: vi.fn() };

vi.mock('./hooks/useLayoutGuideSettingsPanel/useLayoutGuideSettingsPanel', () => ({ useLayoutGuideSettingsPanel: (): unknown => panel }));
vi.mock('./LayoutGuideSettingsHeader/LayoutGuideSettingsHeader', () => ({ default: recordAs('header') }));
vi.mock('./LayoutGuideColumnsFields/LayoutGuideColumnsFields', () => ({ default: recordAs('columns') }));
vi.mock('./LayoutGuideRowsFields/LayoutGuideRowsFields', () => ({ default: recordAs('rows') }));
vi.mock('./LayoutGuideGridFields/LayoutGuideGridFields', () => ({ default: recordAs('grid') }));

const renderPanel = (type: LayoutGuideType): Record<string, TFunc> => {
  const handlers = { onChange: vi.fn(), onClose: vi.fn(), onDragEnd: vi.fn(), onDragStart: vi.fn(), onFieldScrub: vi.fn() };

  render(<LayoutGuideSettingsPanel {...handlers} guide={createLayoutGuide(type)} isStretchedOnAny mixedKeys={new Set()} />);

  return handlers;
};

describe('LayoutGuideSettingsPanel behaviors', () => {
  it('should show the columns fields for a columns guide and change the type from the header', () => {
    // before
    const { onChange, onClose } = renderPanel(LayoutGuideType.columns);

    // action
    (childProps.header.at(-1)!.onTypeChange as TFunc<[LayoutGuideType]>)(LayoutGuideType.rows);

    // result
    expect(onChange).toHaveBeenCalledWith({ type: LayoutGuideType.rows });
    expect(childProps.header.at(-1)).toMatchObject({ onClose, type: LayoutGuideType.columns });
    expect(childProps.columns.at(-1)).toMatchObject({ ...panel, isStretchedOnAny: true, onChange });
  });

  it('should show the rows fields for a rows guide and the grid fields for a grid', () => {
    // before
    renderPanel(LayoutGuideType.rows);
    renderPanel(LayoutGuideType.grid);

    // result
    expect(childProps.rows).toHaveLength(1);
    expect(childProps.grid.at(-1)).toMatchObject(panel);
  });
});
