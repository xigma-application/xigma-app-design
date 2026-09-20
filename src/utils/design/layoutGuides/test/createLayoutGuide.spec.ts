// types
import { LayoutGuideColumnsAlign, LayoutGuideRowsAlign, LayoutGuideType } from 'types/design/enums';

// utils
import { createLayoutGuide } from '../createLayoutGuide';

describe('createLayoutGuide', () => {
  it('should create a grid guide with a default size', () => {
    // action
    const guide = createLayoutGuide(LayoutGuideType.grid);

    // result
    expect(guide).toEqual({ color: '#FF0000', opacity: 10, size: 10, type: LayoutGuideType.grid });
  });

  it('should create a columns guide stretched by default', () => {
    // action
    const guide = createLayoutGuide(LayoutGuideType.columns);

    // result
    expect(guide).toEqual({
      color: '#FF0000',
      columnsAlign: LayoutGuideColumnsAlign.stretch,
      count: 5,
      gutter: 20,
      margin: 0,
      opacity: 10,
      type: LayoutGuideType.columns,
    });
  });

  it('should create a rows guide stretched by default', () => {
    // action
    const guide = createLayoutGuide(LayoutGuideType.rows);

    // result
    expect(guide).toEqual({
      color: '#FF0000',
      count: 5,
      gutter: 20,
      margin: 0,
      opacity: 10,
      rowsAlign: LayoutGuideRowsAlign.stretch,
      type: LayoutGuideType.rows,
    });
  });
});
