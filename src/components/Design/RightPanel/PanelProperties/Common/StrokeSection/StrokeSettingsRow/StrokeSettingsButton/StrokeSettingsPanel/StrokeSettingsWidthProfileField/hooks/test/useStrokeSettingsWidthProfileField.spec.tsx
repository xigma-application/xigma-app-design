import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useStrokeSettingsWidthProfileField } from '../useStrokeSettingsWidthProfileField';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeProfile } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addAndSelect = (): string => {
  store.dispatch(
    addNode({ fills: [], height: 10, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

describe('useStrokeSettingsWidthProfileField', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should start with the Uniform profile and write the chosen one to the node', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsWidthProfileField(), { wrapper });

    // result
    expect(result.current.profile).toBe(StrokeProfile.uniform);
    expect(result.current.flipped).toBe(false);

    // action
    act(() => result.current.onProfileSelect(StrokeProfile.quarterTaper));

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeProfile).toBe(StrokeProfile.quarterTaper);
    expect(result.current.profile).toBe(StrokeProfile.quarterTaper);
  });

  it('should not write anything when the current profile is selected again', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsWidthProfileField(), { wrapper });

    // action
    act(() => result.current.onProfileSelect(StrokeProfile.uniform));

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeProfile).toBeUndefined();
  });

  it('should do nothing when there is no selected node', () => {
    // before
    const { result } = renderHook(() => useStrokeSettingsWidthProfileField(), { wrapper });

    // action
    act(() => result.current.onProfileSelect(StrokeProfile.wedge));
    act(() => result.current.onFlipToggle());

    // result
    expect(result.current.profile).toBe(StrokeProfile.uniform);
    expect(result.current.flipped).toBe(false);
  });

  it('should toggle the flipped flag on the node', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsWidthProfileField(), { wrapper });

    // action
    act(() => result.current.onFlipToggle());

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeProfileFlipped).toBe(true);
    expect(result.current.flipped).toBe(true);

    // action
    act(() => result.current.onFlipToggle());

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeProfileFlipped).toBe(false);
    expect(result.current.flipped).toBe(false);
  });

  it('should show no profile for a mixed selection and apply a picked profile to every node', () => {
    // mock
    const firstId = addAndSelect();
    const secondId = addAndSelect();
    const profiles = Object.values(StrokeProfile);

    store.dispatch(updateNode({ changes: { strokeProfile: profiles[1] }, id: secondId }));
    store.dispatch(setSelection([firstId, secondId]));

    const readProfile = (id: string): StrokeProfile | undefined =>
      (selectActivePage(store.getState()).nodes[id] as TRectangleNode).strokeProfile;

    // before
    const { result } = renderHook(() => useStrokeSettingsWidthProfileField(), { wrapper });

    // result
    expect(result.current.profile).toBeUndefined();

    // action
    act(() => result.current.onProfileSelect(profiles[2]));

    // result
    expect([readProfile(firstId), readProfile(secondId)]).toEqual([profiles[2], profiles[2]]);
  });
});
