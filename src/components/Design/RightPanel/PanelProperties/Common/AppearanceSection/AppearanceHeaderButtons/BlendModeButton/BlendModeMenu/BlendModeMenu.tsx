import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useBlendModeHoverPreview } from './hooks/useBlendModeHoverPreview';

// others
import { translationNameSpace } from '../../../constants';

// types
import { BLEND_MODE_GROUPS } from 'types/design/constants';
import { BlendMode } from 'types/design/enums';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

export type TBlendModeMenuProps = {
  nodeIds: string[];
  onSelect: (blendMode: BlendMode) => TFunc;
  value: BlendMode | undefined;
};

export const BlendModeMenu: FC<TBlendModeMenuProps> = ({ nodeIds, onSelect, value }) => {
  const { t } = useTranslation();
  const { onOptionMouseEnter, onOptionMouseLeave } = useBlendModeHoverPreview(nodeIds);

  return (
    <Fragment>
      {BLEND_MODE_GROUPS.map((group, index) => (
        <Fragment key={group[0]}>
          {index > 0 && <PopoverSeparator />}
          {group.map((blendMode) => (
            <div key={blendMode} onMouseEnter={onOptionMouseEnter(blendMode)} onMouseLeave={onOptionMouseLeave}>
              <PopoverItem
                label={t(`${translationNameSpace}.blendMode.options.${blendMode}`)}
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
