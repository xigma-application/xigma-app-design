import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

export type TIgnoreAutoLayoutToggleProps = {
  active: boolean;
  onToggle: TFunc;
  show: boolean;
};

export const IgnoreAutoLayoutToggle: FC<TIgnoreAutoLayoutToggleProps> = ({ active, onToggle, show }) => {
  const { t } = useTranslation();

  if (!show) {
    return null;
  }

  return (
    <Tooltip content={t(`${translationNameSpace}.ignoreAutoLayoutTooltip`)}>
      <UITools.ButtonIcon
        ariaLabel={t(`${translationNameSpace}.ignoreAutoLayoutAriaLabel`)}
        name="PositionSwitcher"
        onClick={onToggle}
        selected={active}
      />
    </Tooltip>
  );
};

export default IgnoreAutoLayoutToggle;
