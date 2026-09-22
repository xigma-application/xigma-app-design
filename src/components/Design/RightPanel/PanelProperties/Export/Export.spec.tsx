import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Export from './Export';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { registerPatternThumbnailSampler } from 'utils/canvas/patternThumbnail/patternThumbnailRegistry';

const renderExport = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Export />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

const addAndSelectFrame = (name = 'Frame 1'): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [],
      height: 200,
      name,
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

const addRow = (): void => {
  fireEvent.click(screen.getByLabelText('Add export setting'));
};

const openSettings = (): void => {
  fireEvent.click(screen.getByLabelText('Export settings'));
};

describe('Export snapshots', () => {
  it('should render the Export section with its add button', () => {
    // before
    const { asFragment } = renderExport();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Export behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should label the section "Export"', () => {
    // before
    renderExport();

    // result
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('should add a row with default scale and format on add', () => {
    // before
    renderExport();

    // action
    addRow();

    // result
    expect(screen.getByText('1x')).toBeInTheDocument();
    expect(screen.getByText('PNG')).toBeInTheDocument();
  });

  it('should add another row for every add click', () => {
    // before
    renderExport();

    // action
    addRow();
    addRow();

    // result
    expect(screen.getAllByLabelText('Delete export setting')).toHaveLength(2);
  });

  it('should not show the reorder handle with a single row', () => {
    // before
    renderExport();
    addRow();

    // result
    expect(screen.queryByLabelText('Reorder export setting')).toBeNull();
  });

  it('should show the reorder handle once a second row exists', () => {
    // before
    renderExport();
    addRow();
    addRow();

    // result
    expect(screen.getAllByLabelText('Reorder export setting')).toHaveLength(2);
  });

  it('should select a row on click and clear the selection on an outside click', () => {
    // before
    renderExport();
    addRow();
    addRow();

    const handles = screen.getAllByLabelText('Reorder export setting');
    const firstRow = handles[0].parentElement as HTMLElement;

    // action
    fireEvent.click(firstRow);

    // result
    expect(firstRow.className).toContain('ExportRow--selected');

    // action
    fireEvent.mouseDown(document.body);

    // result
    expect(firstRow.className).not.toContain('ExportRow--selected');
  });

  it('should not select a row on click when there is only one row', () => {
    // before
    renderExport();
    addRow();

    const [handleTrigger] = screen.getAllByLabelText('Export settings');
    const row = handleTrigger.parentElement as HTMLElement;

    // action
    fireEvent.click(row);

    // result
    expect(row.className).not.toContain('ExportRow--selected');
  });

  it('should highlight the row with the picker-open background while its settings popover is open', () => {
    // before
    renderExport();
    addRow();
    const row = screen.getByLabelText('Export settings').parentElement as HTMLElement;

    // result
    expect(row.className).not.toContain('ExportRow--pickerOpen');

    // action
    openSettings();

    // result
    expect(row.className).toContain('ExportRow--pickerOpen');
  });

  it('should show the drop indicator while dragging a row and hide it once released', () => {
    // before
    const { container } = renderExport();
    addRow();
    addRow();

    const handles = screen.getAllByLabelText('Reorder export setting');
    const firstRow = handles[0].parentElement as HTMLElement;
    const secondRow = handles[1].parentElement as HTMLElement;
    const rowsContainer = container.querySelector('[class*="Export__rows"]') as HTMLElement;

    vi.spyOn(rowsContainer, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);
    vi.spyOn(firstRow, 'getBoundingClientRect').mockReturnValue({ height: 32, top: 0 } as DOMRect);
    vi.spyOn(secondRow, 'getBoundingClientRect').mockReturnValue({ height: 32, top: 32 } as DOMRect);

    // action
    fireEvent.pointerDown(handles[0]);
    fireEvent(window, new PointerEvent('pointermove', { clientY: 40 }));

    // result
    expect(container.querySelector('[class*="FillDropIndicator"]')).toBeInTheDocument();

    // action
    fireEvent(window, new PointerEvent('pointerup'));

    // result
    expect(container.querySelector('[class*="FillDropIndicator"]')).toBeNull();
  });

  it('should change the scale from the dropdown', () => {
    // before
    renderExport();
    addRow();

    // action
    fireEvent.click(screen.getByText('1x'));
    fireEvent.click(screen.getByText('2x'));

    // result
    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.queryByText('1x')).toBeNull();
  });

  it('should change the format from the dropdown', () => {
    // before
    renderExport();
    addRow();

    // action
    fireEvent.click(screen.getByText('PNG'));
    fireEvent.click(screen.getByText('SVG'));

    // result
    expect(screen.getByText('SVG')).toBeInTheDocument();
    expect(screen.queryByText('PNG')).toBeNull();
  });

  it('should remove a row with the delete button', () => {
    // before
    renderExport();
    addRow();

    // action
    fireEvent.click(screen.getByLabelText('Delete export setting'));

    // result
    expect(screen.queryByLabelText('Delete export setting')).toBeNull();
  });

  it('should open the settings popover with the default values', () => {
    // before
    renderExport();
    addRow();

    // action
    openSettings();

    // result
    expect(screen.getByPlaceholderText('None')).toBeInTheDocument();
    expect(screen.getByText('sRGB (same as file)')).toBeInTheDocument();
    expect(screen.getByText('Detailed')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
    expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
  });

  it('should commit the suffix on blur', () => {
    // before
    renderExport();
    addRow();
    openSettings();

    // action
    fireEvent.blur(screen.getByPlaceholderText('None'), { target: { value: '@2x' } });

    // result
    expect(screen.getByDisplayValue('@2x')).toBeInTheDocument();
  });

  it('should change the color profile from the dropdown', () => {
    // before
    renderExport();
    addRow();
    openSettings();

    // action
    fireEvent.click(screen.getByText('sRGB (same as file)'));
    fireEvent.click(screen.getByText('Display P3'));

    // result
    expect(screen.getByText('Display P3')).toBeInTheDocument();
  });

  it('should change the image resampling from the dropdown', () => {
    // before
    renderExport();
    addRow();
    openSettings();

    // action
    fireEvent.click(screen.getByText('Detailed'));
    fireEvent.click(screen.getByText('Basic'));

    // result
    expect(screen.getByText('Basic')).toBeInTheDocument();
  });

  it('should hide the quality field for png and show it for jpeg and pdf', () => {
    // before
    renderExport();
    addRow();
    openSettings();

    // result
    expect(screen.queryByText('Quality')).toBeNull();

    // action
    fireEvent.click(screen.getByLabelText('Close'));
    fireEvent.click(screen.getAllByText('PNG')[0]);
    fireEvent.click(screen.getByText('JPEG'));
    openSettings();

    // result
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();

    // action
    fireEvent.click(screen.getByLabelText('Close'));
    fireEvent.click(screen.getAllByText('JPEG')[0]);
    fireEvent.click(screen.getByText('PDF'));
    openSettings();

    // result
    expect(screen.getByText('Quality')).toBeInTheDocument();
  });

  it('should change the jpeg quality from the dropdown', () => {
    // before
    renderExport();
    addRow();
    fireEvent.click(screen.getAllByText('PNG')[0]);
    fireEvent.click(screen.getByText('JPEG'));
    openSettings();

    // action
    fireEvent.click(screen.getByText('High'));
    fireEvent.click(screen.getByText('Low'));

    // result
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.queryByText('High')).toBeNull();
  });

  it('should toggle the ignore overlapping layers checkbox', () => {
    // before
    renderExport();
    addRow();
    openSettings();

    // action
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    // result
    expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked();
  });

  it('should toggle the include bounding box checkbox', () => {
    // before
    renderExport();
    addRow();
    openSettings();

    // action
    fireEvent.click(screen.getAllByRole('checkbox')[1]);

    // result
    expect(screen.getAllByRole('checkbox')[1]).toBeChecked();
  });

  it('should hide outline text and include id attribute for png/jpeg, show only outline text for pdf, and show both for svg', () => {
    // before
    renderExport();
    addRow();
    openSettings();

    // result: png (default format)
    expect(screen.queryByText('Outline text')).toBeNull();
    expect(screen.queryByText('Include "id" attribute')).toBeNull();

    // action: switch to pdf
    fireEvent.click(screen.getByLabelText('Close'));
    fireEvent.click(screen.getAllByText('PNG')[0]);
    fireEvent.click(screen.getByText('PDF'));
    openSettings();

    // result: pdf
    expect(screen.getByText('Outline text')).toBeInTheDocument();
    expect(screen.queryByText('Include "id" attribute')).toBeNull();

    // action: switch to svg
    fireEvent.click(screen.getByLabelText('Close'));
    fireEvent.click(screen.getAllByText('PDF')[0]);
    fireEvent.click(screen.getByText('SVG'));
    openSettings();

    // result: svg
    expect(screen.getByText('Outline text')).toBeInTheDocument();
    expect(screen.getByText('Include "id" attribute')).toBeInTheDocument();
  });

  it('should toggle the outline text and include id attribute checkboxes for svg', () => {
    // before
    renderExport();
    addRow();
    openSettings();
    fireEvent.click(screen.getByLabelText('Close'));
    fireEvent.click(screen.getAllByText('PNG')[0]);
    fireEvent.click(screen.getByText('SVG'));
    openSettings();

    // action
    fireEvent.click(screen.getAllByRole('checkbox')[2]);
    fireEvent.click(screen.getAllByRole('checkbox')[3]);

    // result
    expect(screen.getAllByRole('checkbox')[2]).toBeChecked();
    expect(screen.getAllByRole('checkbox')[3]).toBeChecked();
  });

  it('should close the settings popover with the close button', () => {
    // before
    renderExport();
    addRow();
    openSettings();

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(screen.queryByPlaceholderText('None')).toBeNull();
  });

  it('should show the export button and preview for the whole page, named after it, when nothing is selected', () => {
    // before
    renderExport();
    addRow();

    // result — whole-page export, so the button is named after the active page instead of any node
    const pageName = selectActivePage(store.getState()).name;

    expect(screen.getByRole('button', { name: `Export ${pageName}` })).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should not show the export button or preview without any rows', () => {
    // before
    addAndSelectFrame();
    renderExport();

    // result
    expect(screen.queryByText('Export Frame 1')).toBeNull();
    expect(screen.queryByText('Preview')).toBeNull();
  });

  it('should show the export button with the selected node name once a row exists', () => {
    // before
    addAndSelectFrame('My Frame');
    renderExport();

    // action
    addRow();

    // result
    expect(screen.getByRole('button', { name: 'Export My Frame' })).toBeInTheDocument();
  });

  it('should disable the export button while exporting, then re-enable it once done', async () => {
    // before
    addAndSelectFrame('My Frame');
    renderExport();
    addRow();

    const button = screen.getByRole('button', { name: 'Export My Frame' });

    // action
    fireEvent.click(button);

    // result — no export renderer is registered in this test, so nothing is actually rendered/downloaded,
    // but the click still flips the exporting flag synchronously before it resolves
    expect(button).toBeDisabled();

    // result
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it('should show the preview thumbnail once expanded', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValue('data:image/png;base64,abc');
    const unregister = registerPatternThumbnailSampler(sampler);

    // before
    const id = addAndSelectFrame();
    const { container } = renderExport();
    addRow();

    // action
    fireEvent.click(screen.getByText('Preview'));

    // result
    await waitFor(() =>
      expect(container.querySelector('[class*="ExportPreview__image"]')).toHaveStyle({
        backgroundImage: 'url("data:image/png;base64,abc")',
      }),
    );
    expect(sampler).toHaveBeenCalledWith(id, 256);

    // after
    unregister();
  });
});
