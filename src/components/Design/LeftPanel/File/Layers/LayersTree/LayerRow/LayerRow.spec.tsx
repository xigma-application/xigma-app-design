import { ReactElement, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import LayerRow from './LayerRow';

// store
import { addNodes } from 'store/design/slice';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

vi.mock('shared', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  TreeItem: ({ children, hideActions, node, renderIcon, renderMenu }: Record<string, unknown>): ReactElement => (
    <div data-hide-actions={String(hideActions)}>
      {(renderIcon as (item: unknown) => ReactNode)(node)}
      {(renderMenu as (params: unknown) => ReactNode)({ isOpen: true })}
      {(renderMenu as (params: unknown) => ReactNode)({ isOpen: false })}
      {children as ReactNode}
    </div>
  ),
}));
vi.mock('./LayerRowIcon/LayerRowIcon', () => ({
  default: ({ isMask, isParentManagedLayout }: Record<string, boolean>): ReactElement => (
    <span>{`icon mask:${isMask} managed:${isParentManagedLayout}`}</span>
  ),
}));
vi.mock('../LayerContextMenu/LayerContextMenu', () => ({
  default: ({ node }: { node: TSceneNode }): ReactElement => <span>{`menu ${node.id}`}</span>,
}));
vi.mock('./LayerRowMaskDecorations/LayerRowMaskDecorations', () => ({ default: (): ReactElement => <span>decorations</span> }));

const node = (id: string, type: NodeType, parentId: string | null, extra: object = {}): TSceneNode =>
  ({ childIds: [], id, name: id, parentId, type, ...extra }) as unknown as TSceneNode;

describe('LayerRow behaviors', () => {
  beforeAll(() => {
    store.dispatch(
      addNodes({
        nodes: [
          node('lr-mask', NodeType.mask, null, { childIds: ['lr-content', 'lr-shape'] }),
          node('lr-content', NodeType.rectangle, 'lr-mask'),
          node('lr-shape', NodeType.rectangle, 'lr-mask'),
          node('lr-auto', NodeType.frame, null, { childIds: ['lr-flow'], layoutMode: LayoutMode.horizontal }),
          node('lr-flow', NodeType.rectangle, 'lr-auto'),
          node('lr-root', NodeType.rectangle, null),
        ],
        rootIds: ['lr-mask', 'lr-auto', 'lr-root'],
      }),
    );
  });

  const renderRow = (id: string): void => {
    render(
      <Provider store={store}>
        <LayerRow isSelected={false} node={store.getState().design.pages[store.getState().design.activePageId].nodes[id]} />
      </Provider>,
    );
  };

  it('should render a mask shape row with its actions hidden and its context menu when open', () => {
    // before
    renderRow('lr-shape');

    // result
    expect(screen.getByText('icon mask:true managed:false')).toBeInTheDocument();
    expect(screen.getByText('menu lr-shape')).toBeInTheDocument();
    expect(screen.getByText('decorations').parentElement).toHaveAttribute('data-hide-actions', 'true');
  });

  it('should mark a child of an auto layout frame', () => {
    // before
    renderRow('lr-flow');

    // result
    expect(screen.getByText('icon mask:false managed:true')).toBeInTheDocument();
  });

  it('should render a page layer as a plain row', () => {
    // before
    renderRow('lr-root');

    // result
    expect(screen.getByText('icon mask:false managed:false')).toBeInTheDocument();
  });
});
