import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Provider } from 'react-redux';

// components
import SectionHeaderMenu from './SectionHeaderMenu';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSectionNode } from 'types/design/types';

// utils
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';

const makeSection = (id: string, childIds: string[] = [], parentId: string | null = null): TSectionNode => ({
  ...getDefaultSectionStyle(),
  childIds,
  height: 100,
  id,
  name: 'Section 1',
  parentId,
  rotation: 0,
  type: NodeType.section,
  width: 100,
  x: 0,
  y: 0,
});

const renderComponent = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <PopoverPrimitive.Root open>
        <SectionHeaderMenu />
      </PopoverPrimitive.Root>
    </Provider>,
  );

describe('SectionHeaderMenu behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should keep the section as it is when the disabled Group item is clicked', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeSection('menuToGroup')], rootIds: ['menuToGroup'] }));
    store.dispatch(setSelection(['menuToGroup']));

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByText('Group'));

    // result
    expect(selectNodes(store.getState()).menuToGroup.type).toBe(NodeType.section);
  });

  it('should turn the selected section into a frame', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeSection('menuToFrame')], rootIds: ['menuToFrame'] }));
    store.dispatch(setSelection(['menuToFrame']));

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByText('Frame'));

    // result
    expect(selectNodes(store.getState()).menuToFrame.type).toBe(NodeType.frame);
  });

  it('should disable Frame when a selected section holds another section', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [makeSection('menuOuter', ['menuInner']), makeSection('menuInner', [], 'menuOuter'), makeSection('menuPlain')],
        rootIds: ['menuOuter', 'menuPlain'],
      }),
    );
    store.dispatch(setSelection(['menuOuter', 'menuPlain']));

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByText('Frame'));

    // result
    expect(selectNodes(store.getState()).menuOuter.type).toBe(NodeType.section);
    expect(selectNodes(store.getState()).menuPlain.type).toBe(NodeType.section);
  });
});
