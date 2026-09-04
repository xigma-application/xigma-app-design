import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import OutlinesMenu from './OutlinesMenu/OutlinesMenu';
import PanelsMenu from './PanelsMenu/PanelsMenu';
import ZoomToMenu from './ZoomToMenu/ZoomToMenu';
import { MenuCompound } from 'shared';

// hooks
import { useViewMenuAdditionalLabelsClick } from './hooks/useViewMenuAdditionalLabelsClick';
import { useViewMenuFrameOutlinesClick } from './hooks/useViewMenuFrameOutlinesClick';
import { useViewMenuMaskOutlinesClick } from './hooks/useViewMenuMaskOutlinesClick';
import { useViewMenuRulersClick } from './hooks/useViewMenuRulersClick';
import { useViewMenuZoomInClick } from './hooks/useViewMenuZoomInClick';
import { useViewMenuZoomOutClick } from './hooks/useViewMenuZoomOutClick';
import { useViewMenuZoomTo100Click } from './hooks/useViewMenuZoomTo100Click';
import { useViewMenuZoomToFitClick } from './hooks/useViewMenuZoomToFitClick';
import { useViewMenuZoomToNextFrameClick } from './hooks/useViewMenuZoomToNextFrameClick';
import { useViewMenuZoomToPreviousFrameClick } from './hooks/useViewMenuZoomToPreviousFrameClick';
import { useViewMenuZoomToSelectionClick } from './hooks/useViewMenuZoomToSelectionClick';

// store
import {
  selectAreAdditionalLabelsVisible,
  selectAreFrameOutlinesVisible,
  selectAreMaskOutlinesVisible,
  selectAreRulersVisible,
  selectSelectedIds,
  selectTopLevelFrameNodes,
  selectViewport,
} from 'store/design/selectors';
import { useAppSelector } from 'store';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { GLOBE } from 'constant/mainKeys';
import {
  VIEW_MENU_ADDITIONAL_LABELS_KEY,
  VIEW_MENU_ANNOTATIONS_KEY,
  VIEW_MENU_COMMENTS_KEY,
  VIEW_MENU_FIND_NEXT_FRAME_KEY,
  VIEW_MENU_FIND_PREVIOUS_FRAME_KEY,
  VIEW_MENU_FRAME_OUTLINES_KEY,
  VIEW_MENU_LAYOUT_GUIDES_KEY,
  VIEW_MENU_MASK_OUTLINES_KEY,
  VIEW_MENU_MEMORY_USAGE_KEY,
  VIEW_MENU_MINIMIZE_UI_KEY,
  VIEW_MENU_MULTIPLAYER_CURSORS_KEY,
  VIEW_MENU_NEXT_PAGE_KEY,
  VIEW_MENU_OUTLINES_KEY,
  VIEW_MENU_PANELS_KEY,
  VIEW_MENU_PIXEL_GRID_KEY,
  VIEW_MENU_PIXEL_PREVIEW_KEY,
  VIEW_MENU_PREVIOUS_PAGE_KEY,
  VIEW_MENU_RULERS_KEY,
  VIEW_MENU_SHOW_HIDE_UI_KEY,
  VIEW_MENU_SHOW_SLICES_KEY,
  VIEW_MENU_SWITCH_TO_DEV_MODE_KEY,
  VIEW_MENU_SWITCH_TO_DRAW_KEY,
  VIEW_MENU_ZOOM_IN_KEY,
  VIEW_MENU_ZOOM_OUT_KEY,
  VIEW_MENU_ZOOM_TO_100_KEY,
  VIEW_MENU_ZOOM_TO_FIT_KEY,
  VIEW_MENU_ZOOM_TO_NEXT_FRAME_KEY,
  VIEW_MENU_ZOOM_TO_PERCENTAGE_MENU_KEY,
  VIEW_MENU_ZOOM_TO_PREVIOUS_FRAME_KEY,
  VIEW_MENU_ZOOM_TO_SELECTION_KEY,
} from './constants';
import { ZOOM_MAX, ZOOM_MIN } from 'components/Design/Canvas/constants';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

const ViewMenu: FC = () => {
  const { t } = useTranslation();
  const areAdditionalLabelsVisible = useAppSelector(selectAreAdditionalLabelsVisible);
  const areFrameOutlinesVisible = useAppSelector(selectAreFrameOutlinesVisible);
  const areMaskOutlinesVisible = useAppSelector(selectAreMaskOutlinesVisible);
  const areRulersVisible = useAppSelector(selectAreRulersVisible);
  const viewport = useAppSelector(selectViewport);
  const selectedIds = useAppSelector(selectSelectedIds);
  const frameNodes = useAppSelector(selectTopLevelFrameNodes);
  const handleAdditionalLabelsClick = useViewMenuAdditionalLabelsClick();
  const handleFrameOutlinesClick = useViewMenuFrameOutlinesClick();
  const handleMaskOutlinesClick = useViewMenuMaskOutlinesClick();
  const handleRulersClick = useViewMenuRulersClick();
  const handleZoomInClick = useViewMenuZoomInClick();
  const handleZoomOutClick = useViewMenuZoomOutClick();
  const handleZoomTo100Click = useViewMenuZoomTo100Click();
  const handleZoomToFitClick = useViewMenuZoomToFitClick();
  const handleZoomToSelectionClick = useViewMenuZoomToSelectionClick();
  const handleZoomToPreviousFrameClick = useViewMenuZoomToPreviousFrameClick();
  const handleZoomToNextFrameClick = useViewMenuZoomToNextFrameClick();

  return (
    <>
      <MenuItem disabled label={t(VIEW_MENU_PIXEL_GRID_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.pixelGrid.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_LAYOUT_GUIDES_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.layoutGuides.join('')} />
      <MenuItem
        label={t(VIEW_MENU_RULERS_KEY)}
        onClick={handleRulersClick}
        selected={areRulersVisible}
        shortcut={KEYBOARD_SHORTCUTS.rulers.join('')}
      />
      <MenuItem disabled label={t(VIEW_MENU_SHOW_SLICES_KEY)} selected />
      <MenuItem disabled label={t(VIEW_MENU_COMMENTS_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.comments.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_ANNOTATIONS_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.annotations.join('')} />
      <MenuSeparator />
      <MenuSub label={t(VIEW_MENU_OUTLINES_KEY)} withCheck>
        <OutlinesMenu />
      </MenuSub>
      <MenuItem disabled label={t(VIEW_MENU_PIXEL_PREVIEW_KEY)} shortcut={KEYBOARD_SHORTCUTS.pixelPreview.join('')} />
      <MenuItem label={t(VIEW_MENU_MASK_OUTLINES_KEY)} onClick={handleMaskOutlinesClick} selected={areMaskOutlinesVisible} />
      <MenuItem label={t(VIEW_MENU_FRAME_OUTLINES_KEY)} onClick={handleFrameOutlinesClick} selected={areFrameOutlinesVisible} />
      <MenuItem disabled label={t(VIEW_MENU_MEMORY_USAGE_KEY)} />
      <MenuSeparator />
      <MenuItem label={t(VIEW_MENU_ADDITIONAL_LABELS_KEY)} onClick={handleAdditionalLabelsClick} selected={areAdditionalLabelsVisible} />
      <MenuItem disabled label={t(VIEW_MENU_MINIMIZE_UI_KEY)} shortcut={KEYBOARD_SHORTCUTS.toggleUiMinimized.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_SHOW_HIDE_UI_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.showHideUi.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_MULTIPLAYER_CURSORS_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.multiplayerCursors.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_SWITCH_TO_DRAW_KEY)} />
      <MenuItem disabled label={t(VIEW_MENU_SWITCH_TO_DEV_MODE_KEY)} shortcut={KEYBOARD_SHORTCUTS.switchToDevMode.join('')} />
      <MenuSub label={t(VIEW_MENU_PANELS_KEY)} withCheck>
        <PanelsMenu />
      </MenuSub>
      <MenuSeparator />
      <MenuItem
        disabled={viewport.zoom >= ZOOM_MAX}
        label={t(VIEW_MENU_ZOOM_IN_KEY)}
        onClick={handleZoomInClick}
        shortcut={KEYBOARD_SHORTCUTS.zoomIn.join('')}
      />
      <MenuItem
        disabled={viewport.zoom <= ZOOM_MIN}
        label={t(VIEW_MENU_ZOOM_OUT_KEY)}
        onClick={handleZoomOutClick}
        shortcut={KEYBOARD_SHORTCUTS.zoomOut.join('')}
      />
      <MenuItem label={t(VIEW_MENU_ZOOM_TO_100_KEY)} onClick={handleZoomTo100Click} shortcut={KEYBOARD_SHORTCUTS.zoomTo100.join('')} />
      <MenuItem label={t(VIEW_MENU_ZOOM_TO_FIT_KEY)} onClick={handleZoomToFitClick} shortcut={KEYBOARD_SHORTCUTS.zoomToFit.join('')} />
      <MenuItem
        disabled={selectedIds.length === 0}
        label={t(VIEW_MENU_ZOOM_TO_SELECTION_KEY)}
        onClick={handleZoomToSelectionClick}
        shortcut={KEYBOARD_SHORTCUTS.zoomToSelection.join('')}
      />
      <MenuSub label={t(VIEW_MENU_ZOOM_TO_PERCENTAGE_MENU_KEY)} withCheck>
        <ZoomToMenu />
      </MenuSub>
      <MenuSeparator />
      <MenuItem disabled label={t(VIEW_MENU_PREVIOUS_PAGE_KEY)} shortcut={`${GLOBE}${KEYBOARD_SHORTCUTS.previousPage.join('')}`} />
      <MenuItem disabled label={t(VIEW_MENU_NEXT_PAGE_KEY)} shortcut={`${GLOBE}${KEYBOARD_SHORTCUTS.nextPage.join('')}`} />
      <MenuItem
        disabled={frameNodes.length < 2}
        label={t(VIEW_MENU_ZOOM_TO_PREVIOUS_FRAME_KEY)}
        onClick={handleZoomToPreviousFrameClick}
        shortcut={KEYBOARD_SHORTCUTS.zoomToPreviousFrame.join('')}
      />
      <MenuItem
        disabled={frameNodes.length < 2}
        label={t(VIEW_MENU_ZOOM_TO_NEXT_FRAME_KEY)}
        onClick={handleZoomToNextFrameClick}
        shortcut={KEYBOARD_SHORTCUTS.zoomToNextFrame.join('')}
      />
      <MenuItem disabled label={t(VIEW_MENU_FIND_PREVIOUS_FRAME_KEY)} shortcut={KEYBOARD_SHORTCUTS.findPreviousFrame.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_FIND_NEXT_FRAME_KEY)} shortcut={KEYBOARD_SHORTCUTS.findNextFrame.join('')} />
    </>
  );
};

export default ViewMenu;
