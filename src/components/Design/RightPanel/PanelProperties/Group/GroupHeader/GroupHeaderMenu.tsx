import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useConvertGroup } from '../hooks/useConvertGroup';

// others
import { FRAME_PRESET_GROUPS } from '../../framePresetGroups';
import { translationNameSpace } from './constants';

// store
import { selectCanConvertToSection } from 'store/design/selectors';
import { useAppSelector } from 'store';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

const PRESET_ITEM_MAX_WIDTH_PX = 174;

const GroupHeaderMenu: FC = () => {
  const { t } = useTranslation();
  const { onConvertToFrame, onConvertToPreset, onConvertToSection } = useConvertGroup();
  const canConvertToSection = useAppSelector(selectCanConvertToSection);

  return (
    <Fragment>
      <PopoverItem disabled={!canConvertToSection} label={t(`${translationNameSpace}.typeMenu.section`)} onClick={onConvertToSection} />
      <PopoverItem label={t(`${translationNameSpace}.typeMenu.frame`)} onClick={onConvertToFrame} />
      <PopoverItem label={t(`${translationNameSpace}.label`)} selected />
      {FRAME_PRESET_GROUPS.map((group) => (
        <Fragment key={group.labelKey}>
          <PopoverSeparator />
          {group.presets.map((preset) => (
            <PopoverItem
              iconSize={14}
              key={preset.label}
              label={preset.label}
              maxWidth={PRESET_ITEM_MAX_WIDTH_PX}
              onClick={onConvertToPreset(preset.width, preset.height)}
              shortcut={`${preset.width}×${preset.height}`}
              withCheck={false}
            />
          ))}
        </Fragment>
      ))}
    </Fragment>
  );
};

export default GroupHeaderMenu;
