import { FC } from 'react';

// components
import { Menu, MenuCompound } from 'shared';

// hooks
import { usePreventMenuRefocus, useStopClickPropagation } from 'hooks';
import { useGridTrackModeMenu } from './hooks/useGridTrackModeMenu/useGridTrackModeMenu';

// styles
import styles from './grid-track-mode-menu-overlay.module.scss';

const { MenuItem } = MenuCompound;

export const GridTrackModeMenuOverlay: FC = () => {
  const { anchorRef, isOpen, mode, onOpenChange, onSelectMode, options } = useGridTrackModeMenu();
  const handlePreventRefocus = usePreventMenuRefocus();
  const handleStopPropagation = useStopClickPropagation();

  return (
    <Menu
      anchorRef={anchorRef}
      className={styles.GridTrackModeMenuOverlay}
      onClick={handleStopPropagation}
      onCloseAutoFocus={handlePreventRefocus}
      onOpenChange={onOpenChange}
      open={isOpen}
      side="bottom"
      sideOffset={4}
    >
      {options.map((option) => (
        <MenuItem
          icon={option.icon}
          iconSize={option.iconSize}
          key={option.value}
          label={option.label}
          onClick={(): void => onSelectMode(option.value)}
          selected={option.value === mode}
        />
      ))}
    </Menu>
  );
};

export default GridTrackModeMenuOverlay;
