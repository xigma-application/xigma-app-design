import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ResizeToFitButton from './ResizeToFitButton';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';

const makeSection = (id: string, childIds: string[]): TSectionNode => ({
  ...getDefaultSectionStyle(),
  childIds,
  height: 400,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 400,
  x: 0,
  y: 0,
});

const child: TRectangleNode = {
  fills: [],
  height: 40,
  id: 'fitButtonChild',
  name: 'child',
  parentId: 'fitButtonFull',
  rotation: 0,
  type: NodeType.rectangle,
  width: 60,
  x: 30,
  y: 50,
};

const renderComponent = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ResizeToFitButton />
      </TooltipProvider>
    </Provider>,
  );

describe('ResizeToFitButton behaviors', () => {
  beforeAll(() => {
    store.dispatch(
      addNodes({
        nodes: [makeSection('fitButtonEmpty', []), makeSection('fitButtonFull', ['fitButtonChild']), child],
        rootIds: ['fitButtonEmpty', 'fitButtonFull'],
      }),
    );
  });

  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should be disabled when no selected container has children', () => {
    // mock
    store.dispatch(setSelection(['fitButtonEmpty']));

    // before
    renderComponent();

    // result
    expect(screen.getByLabelText('Resize to fit')).toBeDisabled();
  });

  it('should fit the selected section to its children on click', () => {
    // mock
    store.dispatch(setSelection(['fitButtonFull']));

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByLabelText('Resize to fit'));

    // result
    expect(selectNodes(store.getState()).fitButtonFull).toMatchObject({ height: 40, width: 60, x: 30, y: 50 });
  });
});
