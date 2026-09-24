import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useEffectsSection } from './useEffectsSection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { EffectType, NodeType } from 'types/design/enums';
import { TEffect, TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsContext.Provider value={createCanvasRefs()}>{children}</CanvasRefsContext.Provider>
  </Provider>
);

const addRectangle = (effects?: TEffect[]): string => {
  store.dispatch(
    addNode({
      effects,
      fills: [],
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readEffects = (id: string): TEffect[] => (selectActivePage(store.getState()).nodes[id] as TRectangleNode).effects ?? [];

describe('useEffectsSection with several layers selected', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should show the shared effects of layers with the same effect types, flag the differing fields and patch each layer in one undo step', () => {
    // mock
    const shadow = createEffect(EffectType.dropShadow);
    const firstId = addRectangle([{ ...shadow, x: 2 }]);
    const secondId = addRectangle([{ ...shadow, x: 8 }]);

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useEffectsSection(), { wrapper });

    // result
    expect(result.current.isMixed).toBe(false);
    expect([...result.current.getMixedKeys(0)]).toEqual(['x']);

    // action
    act(() => result.current.onChange(0, { y: 12 }));

    // result
    expect([readEffects(firstId)[0], readEffects(secondId)[0]]).toMatchObject([
      { x: 2, y: 12 },
      { x: 8, y: 12 },
    ]);

    act(() => {
      store.dispatch(undo());
    });

    expect([readEffects(firstId)[0].y, readEffects(secondId)[0].y]).toEqual([shadow.y, shadow.y]);
  });

  it('should scrub each layer by the same delta', () => {
    // mock
    const shadow = createEffect(EffectType.dropShadow);
    const firstId = addRectangle([{ ...shadow, x: 2 }]);
    const secondId = addRectangle([{ ...shadow, x: 8 }]);

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useEffectsSection(), { wrapper });

    // action
    act(() => result.current.onFieldScrub(0, 'x', Number.NEGATIVE_INFINITY, 5));

    // result
    expect([readEffects(firstId)[0].x, readEffects(secondId)[0].x]).toEqual([5, 11]);
  });

  it('should be mixed for different effect types and replace every layer effects on add', () => {
    // mock
    const firstId = addRectangle([createEffect(EffectType.dropShadow)]);
    const secondId = addRectangle([createEffect(EffectType.layerBlur)]);

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useEffectsSection(), { wrapper });

    // result
    expect(result.current).toMatchObject({ effects: [], isMixed: true });

    // action
    act(() => result.current.onAdd(EffectType.innerShadow));

    // result
    expect([readEffects(firstId), readEffects(secondId)].map((effects) => effects.map(({ type }) => type))).toEqual([
      [EffectType.innerShadow],
      [EffectType.innerShadow],
    ]);
  });

  it('should hide the effect on every layer when only some had it hidden', () => {
    // mock
    const shadow = createEffect(EffectType.dropShadow);
    const firstId = addRectangle([{ ...shadow, visible: false }]);
    const secondId = addRectangle([shadow]);

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useEffectsSection(), { wrapper });

    // result
    expect(result.current.isHidden(0)).toBe(false);

    // action
    act(() => result.current.onToggleVisible(0));

    // result
    expect([readEffects(firstId)[0].visible, readEffects(secondId)[0].visible]).toEqual([false, false]);
  });
});
