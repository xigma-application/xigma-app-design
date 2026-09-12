import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
import { translationNameSpace } from '../constants';

const BlendModeButton: FC = () => {
  const { t } = useTranslation();

  return (
    <Tooltip content={t(`${translationNameSpace}.blendMode.tooltip`)}>
      <Button ariaLabel={t(`${translationNameSpace}.blendMode.ariaLabel`)} style={{ padding: 5.5 }}>
        <Icon name="DropEmpty" size={13} />
      </Button>
    </Tooltip>
  );
};

export default BlendModeButton;
