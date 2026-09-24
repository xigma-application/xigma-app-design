// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TOriginalStrokeBrush } from '../../types';

// utils
import { getStrokeBrushValues } from 'utils/design/stroke/getStrokeBrushValues';
import { handleStrokeBrushPreview } from '../handleStrokeBrushPreview';

describe('handleStrokeBrushPreview', () => {
  it('should remember each node its original brush on the first preview only, and write the previewed brush', () => {
    // mock
    const originalBrushesRef: { current: TOriginalStrokeBrush[] | null } = { current: null };
    const nodes = [{ id: 'a' }, { id: 'b' }] as TAppearanceNode[];
    const valuesList = [getStrokeBrushValues({ strokeBrush: 'heist' }), getStrokeBrushValues({ strokeBrush: 'noir' })];
    const update = vi.fn();

    // action
    handleStrokeBrushPreview('bubblegum', originalBrushesRef, nodes, valuesList, update);
    handleStrokeBrushPreview('heist', originalBrushesRef, nodes, [valuesList[1], valuesList[1]], update);

    // result
    expect(originalBrushesRef.current).toEqual([
      { brush: 'heist', id: 'a' },
      { brush: 'noir', id: 'b' },
    ]);
    expect(update).toHaveBeenLastCalledWith({ strokeBrush: 'heist' });
  });
});
