// store
import { addNodes } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { makeNetworkVector, makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';
import { resizeVectorToDimensions } from '../resizeVectorToDimensions';

const readVector = (id: string): TVectorNode => selectNodes(store.getState())[id] as TVectorNode;

describe('resizeVectorToDimensions', () => {
  it('should scale the vector around the top-left of its bounds', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeSquareVector({ id: 'resize-vector' })], rootIds: ['resize-vector'] }));

    // before
    resizeVectorToDimensions(store.dispatch, readVector('resize-vector'), { height: 50, width: 200 });

    // result
    expect(getVectorNodeBounds(readVector('resize-vector'))).toEqual({ height: 50, width: 200, x: 0, y: 0 });
  });

  it('should leave an axis without extent unscaled', () => {
    // mock
    const horizontal = makeNetworkVector({ a: { x: 10, y: 20 }, b: { x: 110, y: 20 } }, [['a', 'b']], { id: 'resize-horizontal' });
    const vertical = makeNetworkVector({ a: { x: 10, y: 20 }, b: { x: 10, y: 120 } }, [['a', 'b']], { id: 'resize-vertical' });

    store.dispatch(addNodes({ nodes: [horizontal, vertical], rootIds: ['resize-horizontal', 'resize-vertical'] }));

    // before
    resizeVectorToDimensions(store.dispatch, readVector('resize-horizontal'), { height: 30, width: 50 });
    resizeVectorToDimensions(store.dispatch, readVector('resize-vertical'), { height: 50, width: 30 });

    // result
    expect(getVectorNodeBounds(readVector('resize-horizontal'))).toEqual({ height: 0, width: 50, x: 10, y: 20 });
    expect(getVectorNodeBounds(readVector('resize-vertical'))).toEqual({ height: 50, width: 0, x: 10, y: 20 });
  });
});
