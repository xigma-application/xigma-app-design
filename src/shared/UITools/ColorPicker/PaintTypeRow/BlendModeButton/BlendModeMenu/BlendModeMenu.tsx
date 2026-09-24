import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { PopoverCompound } from 'shared/UITools/Popover/Popover';

// others
import { translationNameSpace } from '../constants';

// types
import { BlendMode } from 'types/design/enums';
import { FACE_BLEND_MODE_GROUPS } from 'types/design/constants';

const { PopoverItem, PopoverSeparator } = PopoverCompound;

export type TBlendModeMenuProps = {
  onPreview?: TFunc<[BlendMode | null]>;
  onSelect: (blendMode: BlendMode) => TFunc;
  value: BlendMode | undefined;
};

export const BlendModeMenu: FC<TBlendModeMenuProps> = ({ onPreview, onSelect, value }) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      {FACE_BLEND_MODE_GROUPS.map((group, index) => (
        <Fragment key={group[0]}>
          {index > 0 && <PopoverSeparator />}
          {group.map((blendMode) => (
            <div key={blendMode} onMouseEnter={(): void => onPreview?.(blendMode)} onMouseLeave={(): void => onPreview?.(null)}>
              <PopoverItem
                label={t(`${translationNameSpace}.options.${blendMode}`)}
                onClick={onSelect(blendMode)}
                selected={value === blendMode}
              />
            </div>
          ))}
        </Fragment>
      ))}
    </Fragment>
  );
};

export default BlendModeMenu;
