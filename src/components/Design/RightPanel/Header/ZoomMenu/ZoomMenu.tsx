import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { PopoverCompound } from 'shared';

// hooks
import { useAdditionalLabelsClick } from './hooks/useAdditionalLabelsClick';
import { useHandleZoomInputChange } from './hooks/useHandleZoomInputChange';
import { useHandleZoomInputCommit } from './hooks/useHandleZoomInputCommit';
import { useRulersClick } from './hooks/useRulersClick';
import { useSelectZoomPercentage } from './hooks/useSelectZoomPercentage';
import { useZoomInClick } from './hooks/useZoomInClick';
import { useZoomOutClick } from './hooks/useZoomOutClick';
import { useZoomToFitClick } from './hooks/useZoomToFitClick';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  VIEW_MENU_ADDITIONAL_LABELS_KEY,
  VIEW_MENU_COMMENTS_KEY,
  VIEW_MENU_LAYOUT_GUIDES_KEY,
  VIEW_MENU_MULTIPLAYER_CURSORS_KEY,
  VIEW_MENU_OUTLINES_KEY,
  VIEW_MENU_PIXEL_GRID_KEY,
  VIEW_MENU_PIXEL_PREVIEW_KEY,
  VIEW_MENU_RULERS_KEY,
  VIEW_MENU_ZOOM_IN_KEY,
  VIEW_MENU_ZOOM_OUT_KEY,
  VIEW_MENU_ZOOM_TO_FIT_KEY,
} from 'components/Design/LeftPanel/NavRail/LogoMenu/ViewMenu/constants';
import { PREFERENCES_MENU_SNAP_TO_PIXEL_GRID_KEY } from 'components/Design/LeftPanel/NavRail/LogoMenu/PreferencesMenu/constants';
import { ZOOM_PERCENTAGE_MENU_PRESETS } from 'components/Design/Canvas/constants';
import { ZOOM_TO_MENU_PERCENTAGE_KEY } from 'components/Design/LeftPanel/NavRail/LogoMenu/ViewMenu/ZoomToMenu/constants';
import { translationNameSpace } from './constants';

// store
import { selectAreAdditionalLabelsVisible, selectAreRulersVisible, selectViewport } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './zoom-menu.module.scss';

const { PopoverItem, PopoverSeparator } = PopoverCompound;

const ZoomMenu: FC = () => {
  const { t } = useTranslation();
  const viewport = useAppSelector(selectViewport);
  const areRulersVisible = useAppSelector(selectAreRulersVisible);
  const areAdditionalLabelsVisible = useAppSelector(selectAreAdditionalLabelsVisible);
  const [inputValue, setInputValue] = useState(String(Math.round(viewport.zoom * 100)));
  const handleInputChange = useHandleZoomInputChange(setInputValue);
  const handleInputCommit = useHandleZoomInputCommit(setInputValue);
  const handleZoomInClick = useZoomInClick();
  const handleZoomOutClick = useZoomOutClick();
  const handleZoomToFitClick = useZoomToFitClick();
  const selectZoomPercentage = useSelectZoomPercentage();
  const handleRulersClick = useRulersClick();
  const handleAdditionalLabelsClick = useAdditionalLabelsClick();

  useEffect(() => {
    setInputValue(String(Math.round(viewport.zoom * 100)));
  }, [viewport.zoom]);

  return (
    <div className={styles.ZoomMenu}>
      <div className={styles['ZoomMenu__input-wrapper']}>
        <input
          aria-label={t(`${translationNameSpace}.inputAriaLabel`)}
          className={styles.ZoomMenu__input}
          onChange={handleInputChange}
          onKeyDown={handleInputCommit}
          value={inputValue}
        />
        <span className={styles['ZoomMenu__input-suffix']}>%</span>
      </div>
      <PopoverSeparator />
      <PopoverItem
        label={t(VIEW_MENU_ZOOM_IN_KEY)}
        onClick={handleZoomInClick}
        shortcut={KEYBOARD_SHORTCUTS.zoomIn.join('')}
        withCheck={false}
      />
      <PopoverItem
        label={t(VIEW_MENU_ZOOM_OUT_KEY)}
        onClick={handleZoomOutClick}
        shortcut={KEYBOARD_SHORTCUTS.zoomOut.join('')}
        withCheck={false}
      />
      <PopoverItem
        label={t(VIEW_MENU_ZOOM_TO_FIT_KEY)}
        onClick={handleZoomToFitClick}
        shortcut={KEYBOARD_SHORTCUTS.zoomToFit.join('')}
        withCheck={false}
      />
      <PopoverSeparator />
      {ZOOM_PERCENTAGE_MENU_PRESETS.map((percent) => (
        <PopoverItem
          key={percent}
          label={t(ZOOM_TO_MENU_PERCENTAGE_KEY, { percent: percent * 100 })}
          onClick={selectZoomPercentage(percent)}
          selected={Math.round(viewport.zoom * 100) === percent * 100}
        />
      ))}
      <PopoverSeparator />
      <PopoverItem disabled label={t(VIEW_MENU_PIXEL_PREVIEW_KEY)} withCheck={false} />
      <PopoverItem disabled label={t(VIEW_MENU_PIXEL_GRID_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.pixelGrid.join('')} />
      <PopoverItem
        disabled
        label={t(PREFERENCES_MENU_SNAP_TO_PIXEL_GRID_KEY)}
        selected
        shortcut={KEYBOARD_SHORTCUTS.snapToPixelGrid.join('')}
      />
      <PopoverItem disabled label={t(VIEW_MENU_LAYOUT_GUIDES_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.layoutGuides.join('')} />
      <PopoverItem
        label={t(VIEW_MENU_RULERS_KEY)}
        onClick={handleRulersClick}
        selected={areRulersVisible}
        shortcut={KEYBOARD_SHORTCUTS.rulers.join('')}
      />
      <PopoverItem disabled label={t(VIEW_MENU_OUTLINES_KEY)} withCheck={false} />
      <PopoverSeparator />
      <PopoverItem
        disabled
        label={t(VIEW_MENU_MULTIPLAYER_CURSORS_KEY)}
        selected
        shortcut={KEYBOARD_SHORTCUTS.multiplayerCursors.join('')}
      />
      <PopoverItem label={t(VIEW_MENU_ADDITIONAL_LABELS_KEY)} onClick={handleAdditionalLabelsClick} selected={areAdditionalLabelsVisible} />
      <PopoverSeparator />
      <PopoverItem disabled label={t(VIEW_MENU_COMMENTS_KEY)} selected shortcut={KEYBOARD_SHORTCUTS.comments.join('')} />
    </div>
  );
};

export default ZoomMenu;
