import { renderHook } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useSectionNameLabelStyle } from '../useSectionNameLabelStyle';

// others
import { SECTION_NAME_LABEL_DARK_STYLE, SECTION_NAME_LABEL_LIGHT_STYLE } from 'utils/canvas/sectionNameLabel/constants';

// store
import { addNodes, setBackgroundPaint } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSectionNode } from 'types/design/types';

const wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

const makeSection = (id: string, fills: TSectionNode['fills']): TSectionNode => ({
  childIds: [],
  fills,
  height: 100,
  id,
  name: 'Section',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 200,
  x: 0,
  y: 0,
});

describe('useSectionNameLabelStyle', () => {
  it('should follow the solid fill of the section being renamed', () => {
    // mock
    store.dispatch(
      addNodes({ nodes: [makeSection('styleSolid', [{ color: '#FFEE88', opacity: 100, type: 'solid' }])], rootIds: ['styleSolid'] }),
    );

    // before
    const { result } = renderHook(() => useSectionNameLabelStyle('styleSolid'), { wrapper });

    // result
    expect(result.current).toMatchObject({ fill: '#FFEE88', textFill: '#000000' });
  });

  it('should follow a light page background when the section has no fill', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeSection('styleEmpty', [])], rootIds: ['styleEmpty'] }));
    store.dispatch(setBackgroundPaint({ color: '#F5F5F5', opacity: 100, type: 'solid' }));

    // before
    const { result } = renderHook(() => useSectionNameLabelStyle('styleEmpty'), { wrapper });

    // result
    expect(result.current).toBe(SECTION_NAME_LABEL_LIGHT_STYLE);
  });

  it('should fall back to the dark style when there is no section to rename', () => {
    // before
    const { result } = renderHook(() => useSectionNameLabelStyle(undefined), { wrapper });

    // result
    expect(result.current).toBe(SECTION_NAME_LABEL_DARK_STYLE);
  });
});
