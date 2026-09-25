// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getTextFlattenTargets } from '../getTextFlattenTargets';

const getTextFlattenVectorMock = vi.fn();

vi.mock('utils/canvas/text/fontOutline/getTextFlattenVector', () => ({
  getTextFlattenVector: (...args: unknown[]): unknown => getTextFlattenVectorMock(...args),
}));

const text = (id: string, pathId?: string): TSceneNode =>
  ({ content: id, id, name: id, parentId: null, pathId, type: NodeType.text }) as unknown as TSceneNode;

describe('getTextFlattenTargets', () => {
  it('should outline every selected text, on its path when it has one, dropping texts without glyphs', async () => {
    // mock
    const path = { id: 'tft-path', parentId: null, type: NodeType.vector } as unknown as TSceneNode;
    const rectangle = { id: 'tft-rect', parentId: null, type: NodeType.rectangle } as unknown as TSceneNode;
    store.dispatch(
      addNodes({
        nodes: [text('tft-a', 'tft-path'), text('tft-empty'), path, rectangle],
        rootIds: ['tft-a', 'tft-empty', 'tft-path', 'tft-rect'],
      }),
    );
    store.dispatch(setSelection(['tft-a', 'tft-empty', 'tft-rect']));
    getTextFlattenVectorMock.mockImplementation(async (_atlas: unknown, node: { id: string }) =>
      node.id === 'tft-a' ? { id: 'outline' } : null,
    );

    // before
    const targets = await getTextFlattenTargets();

    // result
    expect(targets.map(({ node, vector }) => [node.id, vector.id])).toEqual([['tft-a', 'outline']]);
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ id: 'tft-a' }), path);
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ id: 'tft-empty' }), undefined);

    // cleanup
    store.dispatch(setSelection([]));
  });
});
