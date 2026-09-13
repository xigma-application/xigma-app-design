import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../../constants';

// types
import { BlendMode } from 'types/design/enums';
import { FACE_BLEND_MODE_GROUPS } from 'types/design/constants';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

export type TFaceBlendModeMenuProps = {
  onSelect: (blendMode: BlendMode) => TFunc;
  value: BlendMode;
};

export const FaceBlendModeMenu: FC<TFaceBlendModeMenuProps> = ({ onSelect, value }) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      {FACE_BLEND_MODE_GROUPS.map((group, index) => (
        <Fragment key={group[0]}>
          {index > 0 && <PopoverSeparator />}
          {group.map((blendMode) => (
            <PopoverItem
              key={blendMode}
              label={t(`${translationNameSpace}.paint.blendMode.options.${blendMode}`)}
              onClick={onSelect(blendMode)}
              selected={value === blendMode}
            />
          ))}
        </Fragment>
      ))}
    </Fragment>
  );
};

export default FaceBlendModeMenu;
