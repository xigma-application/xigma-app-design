// store
import { updateNode, updateNodes } from 'store/design/slice';

// types
import { LayoutGuideType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { commitLayoutGuides } from '../commitLayoutGuides';
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';

const frameWith = (id: string): TFrameNode => ({ id }) as TFrameNode;

describe('commitLayoutGuides', () => {
  it('should update a single frame with updateNode', () => {
    // mock
    const dispatch = vi.fn();
    const layoutGuides = [createLayoutGuide(LayoutGuideType.grid)];

    // action
    commitLayoutGuides(dispatch, [frameWith('node-1')], () => layoutGuides);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { layoutGuides }, id: 'node-1' }));
  });

  it('should update several frames in one updateNodes', () => {
    // mock
    const dispatch = vi.fn();
    const layoutGuides = [createLayoutGuide(LayoutGuideType.grid)];

    // action
    commitLayoutGuides(dispatch, [frameWith('a'), frameWith('b')], () => layoutGuides);

    // result
    expect(dispatch).toHaveBeenCalledWith(
      updateNodes([
        { changes: { layoutGuides }, id: 'a' },
        { changes: { layoutGuides }, id: 'b' },
      ]),
    );
  });

  it('should do nothing without frames', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitLayoutGuides(dispatch, [], () => []);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
