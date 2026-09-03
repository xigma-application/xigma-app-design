// hooks
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';

// store
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { setActiveTool, setViewport } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmedMedia } from '../../loadArmedMedia';
import { ToolName } from 'types/design/enums';

// utils
import { placeAllArmedMedia } from '../placeAllArmedMedia';

type TFakeImage = { naturalHeight: number; naturalWidth: number; onload: (() => void) | null; src: string };

const stubImageConstructor = (): { getLastImage: () => TFakeImage } => {
  let lastImage: TFakeImage = { naturalHeight: 0, naturalWidth: 0, onload: null, src: '' };

  vi.stubGlobal(
    'Image',
    vi.fn(function FakeImage() {
      lastImage = { naturalHeight: 0, naturalWidth: 0, onload: null, src: '' };
      return lastImage;
    }),
  );

  return { getLastImage: () => lastImage };
};

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, left: 0, top: 0, width: 1000 } as DOMRect);

  return canvas;
};

describe('placeAllArmedMedia', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should do nothing when nothing is armed or queued', async () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });
    const rootOrderLengthBefore = selectActivePage(store.getState()).rootOrder.length;

    // action
    await placeAllArmedMedia(canvas, store.dispatch, store, refs, 'Image');

    // result
    expect(selectActivePage(store.getState()).rootOrder.length).toBe(rootOrderLengthBefore);
  });

  it('should place the armed file and every queued file — largest centered on the panel-aware visible canvas center, the rest cascading up-left — then select them all and revert to the default tool', async () => {
    // mock
    const canvas = createCanvas();
    const armed: TArmedMedia = { naturalHeight: 50, naturalWidth: 50, src: 'blob:armed' };
    const bigFile = new File(['big'], 'big.png', { type: 'image/png' });
    const refs = createCanvasRefs({
      canvasRef: { current: canvas },
      media: { armedRef: { current: armed }, queueRef: { current: [bigFile] } },
    });

    URL.createObjectURL = vi.fn(() => 'blob:big');

    const { getLastImage } = stubImageConstructor();

    store.dispatch(setActiveTool(ToolName.media));

    const selectedIdsBefore = selectSelectedIds(store.getState()).length;

    // action — start placing, then resolve the queued file's async image decode
    const placing = placeAllArmedMedia(canvas, store.dispatch, store, refs, 'Image');
    const image = getLastImage();

    image.naturalWidth = 200;
    image.naturalHeight = 200;
    image.onload?.();

    await placing;

    // result — bigFile (200x200) outranks the armed 50x50 media, so it's the one centered; the
    // canvas is 1000x600 with no panels, so the visible center is world (500, 300)
    const { rootOrder } = selectActivePage(store.getState());
    const [secondToLastId, lastId] = rootOrder.slice(-2);
    const page = store.getState().design.pages[store.getState().design.activePageId];

    expect(page.nodes[secondToLastId]).toMatchObject({ height: 200, src: 'blob:big', width: 200, x: 400, y: 200 });
    // the armed 50x50 media's bottom-right corner (400, 200) lands exactly on bigFile's top-left corner — no gap
    expect(page.nodes[lastId]).toMatchObject({ height: 50, src: 'blob:armed', width: 50, x: 350, y: 150 });
    expect(selectSelectedIds(store.getState()).slice(selectedIdsBefore)).toEqual([secondToLastId, lastId]);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });
});
