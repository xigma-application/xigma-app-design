import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import BlendModeMenu from './BlendModeMenu/BlendModeMenu';
import { Icon, Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from '../../constants';

const BlendModeButton: FC = () => {
  const { t } = useTranslation();

  return (
    <Tooltip content={t(`${translationNameSpace}.blendMode.tooltip`)}>
      <UITools.ButtonMenu trigger={<Icon name="DropEmpty" size={13} />} triggerAriaLabel={t(`${translationNameSpace}.blendMode.ariaLabel`)}>
        <BlendModeMenu />
      </UITools.ButtonMenu>
    </Tooltip>
  );
};

export default BlendModeButton;
