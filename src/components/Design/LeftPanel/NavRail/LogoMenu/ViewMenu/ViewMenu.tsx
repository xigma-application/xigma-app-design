import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import OutlinesMenu from './OutlinesMenu/OutlinesMenu';
import PanelsMenu from './PanelsMenu/PanelsMenu';
import { MenuCompound } from 'shared';

// hooks
import { useViewMenuRulersClick } from './hooks/useViewMenuRulersClick';

// store
import { selectAreRulersVisible } from 'store/design/selectors';
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
  VIEW_MENU_ZOOM_TO_PREVIOUS_FRAME_KEY,
  VIEW_MENU_ZOOM_TO_SELECTION_KEY,
} from './constants';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

const ViewMenu: FC = () => {
  const { t } = useTranslation();
  const areRulersVisible = useAppSelector(selectAreRulersVisible);
  const handleRulersClick = useViewMenuRulersClick();

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
      <MenuItem disabled label={t(VIEW_MENU_MASK_OUTLINES_KEY)} />
      <MenuItem disabled label={t(VIEW_MENU_FRAME_OUTLINES_KEY)} />
      <MenuItem disabled label={t(VIEW_MENU_MEMORY_USAGE_KEY)} />
      <MenuSeparator />
      <MenuItem disabled label={t(VIEW_MENU_ADDITIONAL_LABELS_KEY)} selected />
      <MenuItem disabled label={t(VIEW_MENU_MINIMIZE_UI_KEY)} shortcut={KEYBOARD_SHORTCUTS.toggleUiMinimized.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_SHOW_HIDE_UI_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.showHideUi.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_MULTIPLAYER_CURSORS_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.multiplayerCursors.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_SWITCH_TO_DRAW_KEY)} />
      <MenuItem disabled label={t(VIEW_MENU_SWITCH_TO_DEV_MODE_KEY)} shortcut={KEYBOARD_SHORTCUTS.switchToDevMode.join('')} />
      <MenuSub label={t(VIEW_MENU_PANELS_KEY)} withCheck>
        <PanelsMenu />
      </MenuSub>
      <MenuSeparator />
      <MenuItem disabled label={t(VIEW_MENU_ZOOM_IN_KEY)} shortcut={KEYBOARD_SHORTCUTS.zoomIn.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_ZOOM_OUT_KEY)} shortcut={KEYBOARD_SHORTCUTS.zoomOut.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_ZOOM_TO_100_KEY)} shortcut={KEYBOARD_SHORTCUTS.zoomTo100.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_ZOOM_TO_FIT_KEY)} shortcut={KEYBOARD_SHORTCUTS.zoomToFit.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_ZOOM_TO_SELECTION_KEY)} shortcut={KEYBOARD_SHORTCUTS.zoomToSelection.join('')} />
      <MenuSeparator />
      <MenuItem disabled label={t(VIEW_MENU_PREVIOUS_PAGE_KEY)} shortcut={`${GLOBE}${KEYBOARD_SHORTCUTS.previousPage.join('')}`} />
      <MenuItem disabled label={t(VIEW_MENU_NEXT_PAGE_KEY)} shortcut={`${GLOBE}${KEYBOARD_SHORTCUTS.nextPage.join('')}`} />
      <MenuItem disabled label={t(VIEW_MENU_ZOOM_TO_PREVIOUS_FRAME_KEY)} shortcut={KEYBOARD_SHORTCUTS.zoomToPreviousFrame.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_ZOOM_TO_NEXT_FRAME_KEY)} shortcut={KEYBOARD_SHORTCUTS.zoomToNextFrame.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_FIND_PREVIOUS_FRAME_KEY)} shortcut={KEYBOARD_SHORTCUTS.findPreviousFrame.join('')} />
      <MenuItem disabled label={t(VIEW_MENU_FIND_NEXT_FRAME_KEY)} shortcut={KEYBOARD_SHORTCUTS.findNextFrame.join('')} />
    </>
  );
};

export default ViewMenu;
