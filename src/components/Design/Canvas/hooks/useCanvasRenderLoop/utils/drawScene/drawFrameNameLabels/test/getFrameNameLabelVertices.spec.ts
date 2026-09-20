// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { buildFrameNameLabelVertices } from '../buildFrameNameLabelVertices';
import { FRAME_NAME_LABEL_CACHE_MAX_ENTRIES, frameNameLabelCache } from '../frameNameLabelCache';
import { getFrameNameLabelVertices } from '../getFrameNameLabelVertices';

vi.mock('../buildFrameNameLabelVertices', () => ({ buildFrameNameLabelVertices: vi.fn() }));

const buildFrameNameLabelVerticesMock = vi.mocked(buildFrameNameLabelVertices);

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 10,
  y: 20,
  ...overrides,
});

describe('getFrameNameLabelVertices', () => {
  beforeEach(() => {
    frameNameLabelCache.clear();
    buildFrameNameLabelVerticesMock.mockReset().mockReturnValue(new Float32Array([1, 2, 3]));
  });

  it('should build and cache the vertices on the first call for a node', () => {
    // action
    const result = getFrameNameLabelVertices(buildFrame(), 1);

    // result
    expect(buildFrameNameLabelVerticesMock).toHaveBeenCalledWith(buildFrame(), 1);
    expect(result).toEqual(new Float32Array([1, 2, 3]));
  });

  it('should reuse the cached vertices on a later call with the exact same node reference and zoom', () => {
    // mock
    const frame = buildFrame();

    // before
    getFrameNameLabelVertices(frame, 1);
    buildFrameNameLabelVerticesMock.mockClear();

    // action
    const result = getFrameNameLabelVertices(frame, 1);

    // result
    expect(buildFrameNameLabelVerticesMock).not.toHaveBeenCalled();
    expect(result).toEqual(new Float32Array([1, 2, 3]));
  });

  it('should rebuild when the node changes (a new object reference)', () => {
    // before
    getFrameNameLabelVertices(buildFrame(), 1);
    buildFrameNameLabelVerticesMock.mockClear();

    // action
    getFrameNameLabelVertices(buildFrame({ name: 'Renamed' }), 1);

    // result
    expect(buildFrameNameLabelVerticesMock).toHaveBeenCalledWith(buildFrame({ name: 'Renamed' }), 1);
  });

  it('should rebuild when the zoom changes', () => {
    // mock
    const frame = buildFrame();

    // before
    getFrameNameLabelVertices(frame, 1);
    buildFrameNameLabelVerticesMock.mockClear();

    // action
    getFrameNameLabelVertices(frame, 2);

    // result
    expect(buildFrameNameLabelVerticesMock).toHaveBeenCalledWith(buildFrame(), 2);
  });

  it('should not rebuild just because an unrelated node panned by, keyed independently per node id', () => {
    // mock
    const first = buildFrame();
    const second = buildFrame({ id: 'frame-2' });

    // before
    getFrameNameLabelVertices(first, 1);
    getFrameNameLabelVertices(second, 1);
    buildFrameNameLabelVerticesMock.mockClear();

    // action
    getFrameNameLabelVertices(first, 1);
    getFrameNameLabelVertices(second, 1);

    // result
    expect(buildFrameNameLabelVerticesMock).not.toHaveBeenCalled();
  });

  it('should evict the oldest entry once the cache is full', () => {
    // before
    for (let index = 0; index < FRAME_NAME_LABEL_CACHE_MAX_ENTRIES; index += 1) {
      getFrameNameLabelVertices(buildFrame({ id: `frame-${index}` }), 1);
    }

    const oldestKey = frameNameLabelCache.keys().next().value;

    // action — one more entry than the cache can hold
    getFrameNameLabelVertices(buildFrame({ id: 'frame-overflow' }), 1);

    // result
    expect(frameNameLabelCache.has(oldestKey as string)).toBe(false);
    expect(frameNameLabelCache.size).toBe(FRAME_NAME_LABEL_CACHE_MAX_ENTRIES);
  });
});
