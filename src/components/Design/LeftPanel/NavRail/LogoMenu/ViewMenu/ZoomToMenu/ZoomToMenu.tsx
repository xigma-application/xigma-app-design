import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// hooks
import { useViewMenuZoomToPercentageClick } from '../hooks/useViewMenuZoomToPercentageClick';

// others
import { ZOOM_PERCENTAGE_MENU_PRESETS } from 'components/Design/Canvas/constants';
import { ZOOM_TO_MENU_PERCENTAGE_KEY } from './constants';

const { MenuItem } = MenuCompound;

const ZoomToMenu: FC = () => {
  const { t } = useTranslation();
  const handleZoomToPercentageClick = useViewMenuZoomToPercentageClick();

  return (
    <>
      {ZOOM_PERCENTAGE_MENU_PRESETS.map((percent) => (
        <MenuItem
          key={percent}
          label={t(ZOOM_TO_MENU_PERCENTAGE_KEY, { percent: percent * 100 })}
          onClick={handleZoomToPercentageClick(percent)}
        />
      ))}
    </>
  );
};

export default ZoomToMenu;
