import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
import { translationNameSpace } from '../constants';

const CornerSmoothingButton: FC = () => {
  const { t } = useTranslation();

  return (
    <Tooltip content={t(`${translationNameSpace}.cornerRadius.smoothingTooltip`)}>
      <Button ariaLabel={t(`${translationNameSpace}.cornerRadius.smoothingAriaLabel`)} style={{ padding: 6 }}>
        <Icon name="Properties" size={12} />
      </Button>
    </Tooltip>
  );
};

export default CornerSmoothingButton;
