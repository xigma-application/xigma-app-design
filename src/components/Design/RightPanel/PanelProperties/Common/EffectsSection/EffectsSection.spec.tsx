import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import EffectsSection from './EffectsSection';
import { TooltipProvider } from 'shared';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { BlendMode, EffectType, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const addRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fills: [],
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

const read = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

const renderSection = (): void => {
  render(
    <Provider store={store}>
      <CanvasRefsContext.Provider value={createCanvasRefs()}>
        <TooltipProvider>
          <EffectsSection />
        </TooltipProvider>
      </CanvasRefsContext.Provider>
    </Provider>,
  );
};

const addInnerShadow = (): void => {
  fireEvent.click(screen.getByRole('button', { name: 'Add effect' }));
  fireEvent.click(screen.getByText('Inner shadow'));
};

describe('EffectsSection', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the Effects label with an add button and no rows', () => {
    // Step 1: Render with a selected rectangle
    addRectangle();
    renderSection();

    // Step 2: Assert
    expect(screen.getByText('Effects')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add effect' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reorder effect' })).toBeNull();
  });

  it('should list every effect type in the add menu without a Beta badge', () => {
    // Step 1: Open the menu
    addRectangle();
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Add effect' }));

    // Step 2: Assert
    ['Inner shadow', 'Drop shadow', 'Layer blur', 'Background blur', 'Noise', 'Texture', 'Glass', 'Shader'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
    expect(screen.queryByText('Beta')).toBeNull();
  });

  it('should add an inner shadow with the default values as a row', () => {
    // Step 1: Add the effect
    const id = addRectangle();
    renderSection();
    addInnerShadow();

    // Step 2: Assert the node and the row
    expect(read(id).effects).toEqual([
      { blendMode: BlendMode.normal, blur: 4, color: '#000000', opacity: 25, spread: 0, type: EffectType.innerShadow, x: 0, y: 4 },
    ]);
    expect(screen.getByRole('button', { name: 'Reorder effect' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hide effect' })).toBeTruthy();
  });

  it('should not add effect types that are not supported yet', () => {
    // Step 1: Try to add a noise
    const id = addRectangle();
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Add effect' }));
    fireEvent.click(screen.getByText('Noise'));

    // Step 2: Assert nothing was added
    expect(read(id).effects).toBeUndefined();
  });

  it('should add a layer blur and show only its Blur field with the Uniform / Progressive toggle', () => {
    // Step 1: Add a layer blur
    const id = addRectangle();
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Add effect' }));
    fireEvent.click(screen.getByText('Layer blur'));

    // Step 2: Assert it is saved and the panel shows the blur-specific controls
    expect(read(id).effects?.[0]).toMatchObject({ blur: 4, type: 'layerBlur' });
    expect(screen.getByText('Uniform')).toBeTruthy();
    expect(screen.getByText('Progressive')).toBeTruthy();
    expect(screen.getByLabelText('Effect blur')).toBeTruthy();
    expect(screen.queryByLabelText('Effect X offset')).toBeNull();
    expect(screen.queryByLabelText('Effect color')).toBeNull();
    expect(screen.queryByLabelText('Apply blend mode to effect')).toBeNull();
  });

  it('should allow only one blur per layer by disabling both blur types once one is added', () => {
    // Step 1: Add a layer blur
    const id = addRectangle();
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Add effect' }));
    fireEvent.click(screen.getByText('Layer blur'));

    // Step 2: Open the menu again and try both blur types
    fireEvent.click(screen.getByRole('button', { name: 'Add effect' }));
    fireEvent.click(screen.getByText('Background blur'));
    fireEvent.click(screen.getAllByText('Layer blur').at(-1)!);

    // Step 3: Assert nothing more was added
    expect(read(id).effects).toHaveLength(1);
  });

  it('should hide, show and delete an effect', () => {
    // Step 1: One effect
    const id = addRectangle();
    renderSection();
    addInnerShadow();

    // Step 2: Hide
    fireEvent.click(screen.getByRole('button', { name: 'Hide effect' }));
    expect(read(id).effects?.[0].visible).toBe(false);

    // Step 3: Show
    fireEvent.click(screen.getByRole('button', { name: 'Show effect' }));
    expect(read(id).effects?.[0].visible).toBeUndefined();

    // Step 4: Delete
    fireEvent.click(screen.getByRole('button', { name: 'Delete effect' }));
    expect(read(id).effects).toEqual([]);
  });

  it('should open the settings panel for a newly added effect and commit edited values, including a type change', () => {
    // Step 1: Adding the effect opens its panel
    const id = addRectangle();
    renderSection();
    addInnerShadow();

    // Step 2: Edit X, Blur and Spread
    const x = screen.getByLabelText('Effect X offset') as HTMLInputElement;
    const blur = screen.getByLabelText('Effect blur') as HTMLInputElement;

    fireEvent.change(x, { target: { value: '-6' } });
    fireEvent.blur(x);
    fireEvent.change(blur, { target: { value: '-9' } });
    fireEvent.blur(blur);

    // Step 3: Assert the values, blur clamped to zero
    expect(read(id).effects?.[0]).toMatchObject({ blur: 0, x: -6, y: 4 });

    // Step 4: Change the type from the header
    fireEvent.click(screen.getByRole('button', { name: 'Change effect type' }));
    fireEvent.click(screen.getAllByText('Drop shadow')[0]);
    expect(read(id).effects?.[0].type).toBe(EffectType.dropShadow);
  });

  it('should set the effect blend mode from the panel header', () => {
    // Step 1: Adding the effect opens its panel
    const id = addRectangle();
    renderSection();
    addInnerShadow();

    // Step 2: Pick Multiply from the blend mode menu
    fireEvent.click(screen.getByRole('button', { name: 'Apply blend mode to effect' }));
    fireEvent.click(screen.getByText('Multiply'));

    // Step 3: Assert
    expect(read(id).effects?.[0].blendMode).toBe(BlendMode.multiply);
  });
});
