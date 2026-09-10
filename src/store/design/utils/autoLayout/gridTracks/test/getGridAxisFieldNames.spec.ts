// utils
import { getGridAxisFieldNames } from '../getGridAxisFieldNames';

describe('getGridAxisFieldNames', () => {
  it('should return the column field names', () => {
    expect(getGridAxisFieldNames('column')).toEqual({
      anchorIndex: 'gridColumnAnchorIndex',
      count: 'gridColumnCount',
      sizes: 'gridColumnSizes',
      span: 'gridColumnSpan',
    });
  });

  it('should return the row field names', () => {
    expect(getGridAxisFieldNames('row')).toEqual({
      anchorIndex: 'gridRowAnchorIndex',
      count: 'gridRowCount',
      sizes: 'gridRowSizes',
      span: 'gridRowSpan',
    });
  });
});
