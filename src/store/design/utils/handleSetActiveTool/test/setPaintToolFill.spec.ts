// types
import { TDesignState } from '../../../../types';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';
import { setPaintToolFill } from '../../setPaintToolFill';

const image = [{ opacity: 100, ref: 'r', rotation: 0, scaleMode: 'fill' as const, type: 'image' as const }];

const buildState = (nodes: TDesignState['pages'][string]['nodes'], vectorEditingNodeIds: string[]): TDesignState =>
  ({ activePageId: 'page', pages: { page: { nodes, paintFill: null } }, vectorEditingNodeIds }) as unknown as TDesignState;

describe('setPaintToolFill', () => {
  it('should paint with the image fill the edited vectors share, skipping ids that are not vectors', () => {
    // mock
    const vector = makeSquareVector({ fillByKey: { a: image }, filledFaceKeys: ['a'] });
    const state = buildState({ [vector.id]: vector }, [vector.id, 'missing']);

    // before
    setPaintToolFill(state);

    // result
    expect(state.pages.page.paintFill).toEqual(image);
  });

  it('should clear the image fill mode for vectors without an image fill', () => {
    // mock
    const vector = makeSquareVector();
    const state = buildState({ [vector.id]: vector }, [vector.id]);

    // before
    setPaintToolFill(state);

    // result
    expect(state.pages.page.paintFill).toBeNull();
  });
});
