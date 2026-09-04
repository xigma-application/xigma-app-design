import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { PopoverCompound } from 'shared';

// hooks
import { useConvertSelectionToSection } from 'components/Design/Menu/hooks/useConvertSelectionToSection';

// others
import { FRAME_PRESET_GROUPS } from './framePresetGroups';
import { translationNameSpace } from './constants';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

const { PopoverItem, PopoverSeparator } = PopoverCompound;

const PRESET_ITEM_MAX_WIDTH_PX = 174;

const FrameHeaderMenu: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedIds);
  const onConvertToSection = useConvertSelectionToSection();
  const [frameId] = selectedIds;

  const handleSelectPreset = (width: number, height: number) => (): void => {
    dispatch(updateNode({ changes: { height, width }, id: frameId }));
  };

  return (
    <Fragment>
      <PopoverItem label={t(`${translationNameSpace}.typeMenu.section`)} onClick={onConvertToSection} />
      <PopoverItem label={t(`${translationNameSpace}.label`)} selected />
      <PopoverItem disabled label={t(`${translationNameSpace}.typeMenu.group`)} />
      {FRAME_PRESET_GROUPS.map((group) => (
        <Fragment key={group[0].label}>
          <PopoverSeparator />
          {group.map((preset) => (
            <PopoverItem
              key={preset.label}
              label={preset.label}
              maxWidth={PRESET_ITEM_MAX_WIDTH_PX}
              onClick={handleSelectPreset(preset.width, preset.height)}
              shortcut={`${preset.width}×${preset.height}`}
              withCheck={false}
            />
          ))}
        </Fragment>
      ))}
    </Fragment>
  );
};

export default FrameHeaderMenu;
