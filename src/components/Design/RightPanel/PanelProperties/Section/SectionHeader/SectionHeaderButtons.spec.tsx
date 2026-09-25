import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import SectionHeaderButtons from './SectionHeaderButtons';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSectionNode } from 'types/design/types';

// utils
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';

const makeSection = (id: string): TSectionNode => ({
  ...getDefaultSectionStyle(),
  childIds: [],
  height: 100,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 100,
  x: 0,
  y: 0,
});

const renderComponent = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <SectionHeaderButtons />
      </TooltipProvider>
    </Provider>,
  );

describe('SectionHeaderButtons behaviors', () => {
  beforeAll(() => {
    store.dispatch(addNodes({ nodes: [makeSection('buttonsA'), makeSection('buttonsB')], rootIds: ['buttonsA', 'buttonsB'] }));
  });

  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render only the dev status button for a single section', () => {
    // mock
    store.dispatch(setSelection(['buttonsA']));

    // before
    renderComponent();

    // result
    expect(screen.getByLabelText('Toggle ready for dev status')).toBeInTheDocument();
    expect(screen.queryByLabelText('Wrap in new section')).not.toBeInTheDocument();
  });

  it('should add the wrap in new section button for several sections', () => {
    // mock
    store.dispatch(setSelection(['buttonsA', 'buttonsB']));

    // before
    renderComponent();

    // result
    expect(screen.getByLabelText('Toggle ready for dev status')).toBeInTheDocument();
    expect(screen.getByLabelText('Wrap in new section')).toBeInTheDocument();
  });
});
