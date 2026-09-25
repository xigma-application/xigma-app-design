import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import Section from './Section';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';

const makeSection = (id: string, childIds: string[]): TSectionNode => ({
  ...getDefaultSectionStyle(),
  childIds,
  height: 200,
  id,
  name: 'Section 1',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 300,
  x: 0,
  y: 0,
});

const makeRectangle = (id: string, parentId: string): TRectangleNode => ({
  fills: [{ color: '#D9D9D9', opacity: 100, type: 'solid' }],
  height: 40,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x: 20,
  y: 20,
});

const renderComponent = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Section />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('Section behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should show the Section header, Position, Layout, Appearance, Fill, Stroke, Selection colors and Export', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [makeSection('panelSection', ['panelRect']), makeRectangle('panelRect', 'panelSection')],
        rootIds: ['panelSection'],
      }),
    );
    store.dispatch(setSelection(['panelSection']));

    // before
    renderComponent();

    // result
    expect(screen.getByText('Section')).toBeInTheDocument();
    expect(screen.getByText('Alignment')).toBeInTheDocument();
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByText('Stroke')).toBeInTheDocument();
    expect(screen.getByText('Selection colors')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('should not show the rotation field or the Effects section', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeSection('panelNoRotation', [])], rootIds: ['panelNoRotation'] }));
    store.dispatch(setSelection(['panelNoRotation']));

    // before
    renderComponent();

    // result
    expect(screen.queryByText('Rotation')).not.toBeInTheDocument();
    expect(screen.queryByText('Effects')).not.toBeInTheDocument();
  });
});
