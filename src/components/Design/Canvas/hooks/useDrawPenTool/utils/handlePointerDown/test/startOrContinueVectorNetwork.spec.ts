import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TVectorEditRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { startOrContinueVectorNetwork } from '../startOrContinueVectorNetwork';
import { AppStore } from 'store';

const startNewVectorNetworkMock = vi.fn();
const startVectorFragmentMock = vi.fn();
const continueVectorNetworkMock = vi.fn();

vi.mock('../startNewVectorNetwork', () => ({ startNewVectorNetwork: (...args: unknown[]): void => startNewVectorNetworkMock(...args) }));
vi.mock('../startVectorFragment', () => ({ startVectorFragment: (...args: unknown[]): void => startVectorFragmentMock(...args) }));
vi.mock('../continueVectorNetwork/continueVectorNetwork', () => ({
  continueVectorNetwork: (...args: unknown[]): void => continueVectorNetworkMock(...args),
}));

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { pointerId, ...options });

const createDragOriginRef = (): RefObject<TPenDragOrigin | null> => ({ current: null });
const createDragStartRef = (): RefObject<TPoint | null> => ({ current: null });
const createPendingOutgoingTangentRef = (): RefObject<TPendingOutgoingTangent | null> => ({ current: null });
const createVectorAlignmentGuideRef = (): TVectorEditRefs['vectorAlignmentGuideRef'] => ({ current: null });

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 } },
};

describe('startOrContinueVectorNetwork', () => {
  beforeEach(() => {
    startNewVectorNetworkMock.mockClear();
    startVectorFragmentMock.mockClear();
    continueVectorNetworkMock.mockClear();
  });

  it('should start a brand-new vector network when there is no editing node yet, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const appStore = {} as AppStore;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    startOrContinueVectorNetwork(
      canvas,
      pointerEvent(3),
      { x: 10, y: 20 },
      null,
      null,
      IDENTITY_VIEWPORT,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(startNewVectorNetworkMock).toHaveBeenCalledWith({ x: 10, y: 20 }, dispatch, appStore, dragOriginRef, dragStartRef);
    expect(startVectorFragmentMock).not.toHaveBeenCalled();
    expect(continueVectorNetworkMock).not.toHaveBeenCalled();
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should start a new fragment on the editing node when it has no active vertex yet, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const appStore = {} as AppStore;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    startOrContinueVectorNetwork(
      canvas,
      pointerEvent(4),
      { x: 10, y: 20 },
      node,
      null,
      IDENTITY_VIEWPORT,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(startVectorFragmentMock).toHaveBeenCalledWith(
      { x: 10, y: 20 },
      node,
      IDENTITY_VIEWPORT,
      dispatch,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
    );
    expect(startNewVectorNetworkMock).not.toHaveBeenCalled();
    expect(continueVectorNetworkMock).not.toHaveBeenCalled();
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(4);
  });

  it('should continue the network from the active vertex when one is already set, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const appStore = {} as AppStore;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    startOrContinueVectorNetwork(
      canvas,
      pointerEvent(5),
      { x: 10, y: 20 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(continueVectorNetworkMock).toHaveBeenCalledWith(
      { x: 10, y: 20 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      false,
    );
    expect(startNewVectorNetworkMock).not.toHaveBeenCalled();
    expect(startVectorFragmentMock).not.toHaveBeenCalled();
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(5);
  });

  it("should forward Ctrl/Cmd held during the pointerdown into continueVectorNetwork, so it can mirror into the active vertex's incoming segment", () => {
    // mock
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const appStore = {} as AppStore;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    startOrContinueVectorNetwork(
      canvas,
      pointerEvent(6, { ctrlKey: true }),
      { x: 10, y: 20 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(continueVectorNetworkMock).toHaveBeenCalledWith(
      { x: 10, y: 20 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      true,
      false,
    );
  });

  it('should forward Shift held during the pointerdown into continueVectorNetwork, for the hard 15deg angle constraint', () => {
    // mock
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const appStore = {} as AppStore;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef();

    // before
    startOrContinueVectorNetwork(
      canvas,
      pointerEvent(7, { shiftKey: true }),
      { x: 10, y: 20 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(continueVectorNetworkMock).toHaveBeenCalledWith(
      { x: 10, y: 20 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      createVectorAlignmentGuideRef(),
      false,
      true,
    );
  });
});
