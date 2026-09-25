// store
import { addNodes, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { flipFrameTree } from '../flipFrameTree';

const flipFrameContentMock = vi.fn();

vi.mock('../flipFrameContent', () => ({ flipFrameContent: (...args: unknown[]): unknown => flipFrameContentMock(...args) }));
vi.mock('../getFlippedFrameSettings', () => ({ getFlippedFrameSettings: (): unknown => ({ paddingLeft: 1 }) }));
vi.mock('../getMirroredPosition', () => ({ getMirroredPosition: (): unknown => ({ x: 2 }) }));

describe('flipFrameTree', () => {
  beforeAll(() => {
    store.dispatch(
      addNodes({
        nodes: [
          {
            childIds: [],
            clipContent: true,
            fills: [],
            height: 10,
            id: 'fft-frame',
            name: 'Frame',
            parentId: null,
            rotation: 0,
            type: NodeType.frame,
            width: 10,
            x: 0,
            y: 0,
          } as TFrameNode,
          {
            fills: [],
            height: 10,
            id: 'fft-rect',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 10,
            x: 0,
            y: 0,
          } as TRectangleNode,
        ],
        rootIds: ['fft-frame', 'fft-rect'],
      }),
    );
  });

  it('should flip the frame settings and position, then its content', () => {
    // mock
    const dispatch = vi.fn();

    // before
    flipFrameTree(dispatch, 'fft-frame', 'horizontal', { x: 0, y: 0 });

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { paddingLeft: 1, x: 2 }, id: 'fft-frame' }));
    expect(flipFrameContentMock).toHaveBeenCalledWith(dispatch, 'fft-frame', 'horizontal', flipFrameTree);
  });

  it('should do nothing for a layer that is not a frame', () => {
    // mock
    const dispatch = vi.fn();
    flipFrameContentMock.mockClear();

    // before
    flipFrameTree(dispatch, 'fft-rect', 'vertical', null);
    flipFrameTree(dispatch, 'fft-missing', 'vertical', null);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(flipFrameContentMock).not.toHaveBeenCalled();
  });
});
