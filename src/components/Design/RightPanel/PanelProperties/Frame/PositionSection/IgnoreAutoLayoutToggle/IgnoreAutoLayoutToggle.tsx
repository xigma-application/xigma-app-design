import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

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
      <Button
        ariaLabel={t(`${translationNameSpace}.ignoreAutoLayoutAriaLabel`)}
        onClick={onToggle}
        selected={active}
        style={{ padding: 6 }}
      >
        <Icon name="PositionSwitcher" size={12} />
      </Button>
    </Tooltip>
  );
};

export default IgnoreAutoLayoutToggle;
