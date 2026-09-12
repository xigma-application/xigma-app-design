import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useBlendModeMenu } from './hooks/useBlendModeMenu';

// others
import { translationNameSpace } from '../../../constants';

// types
import { BLEND_MODE_GROUPS } from 'types/design/constants';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

export const BlendModeMenu: FC = () => {
  const { t } = useTranslation();
  const { selectBlendMode, value } = useBlendModeMenu();

  return (
    <Fragment>
      {BLEND_MODE_GROUPS.map((group, index) => (
        <Fragment key={group[0]}>
          {index > 0 && <PopoverSeparator />}
          {group.map((blendMode) => (
            <PopoverItem
              key={blendMode}
              label={t(`${translationNameSpace}.blendMode.options.${blendMode}`)}
              onClick={selectBlendMode(blendMode)}
              selected={value === blendMode}
            />
          ))}
        </Fragment>
      ))}
    </Fragment>
  );
};

export default BlendModeMenu;
