import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { Menu, MenuCompound } from 'shared';

// hooks
import { useImageCropAspectRatioMenu } from './hooks/useImageCropAspectRatioMenu';

// others
import {
  ASPECT_RATIO_CIRCLE,
  ASPECT_RATIO_LANDSCAPE_16_9,
  ASPECT_RATIO_LANDSCAPE_3_2,
  ASPECT_RATIO_LANDSCAPE_4_3,
  ASPECT_RATIO_ORIGINAL,
  ASPECT_RATIO_PORTRAIT_2_3,
  ASPECT_RATIO_PORTRAIT_3_4,
  ASPECT_RATIO_PORTRAIT_9_16,
  ASPECT_RATIO_SQUARE,
} from './constants';
import { translationNameSpace } from '../constants';

// styles
import styles from './image-crop-aspect-ratio-menu.module.scss';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

const ImageCropAspectRatioMenu: FC = () => {
  const { t } = useTranslation();
  const { isCustomActive, isPresetActive, onSelectPreset } = useImageCropAspectRatioMenu();

  return (
    <Menu
      trigger={
        <>
          <Icon name="CustomSize" size={24} />
          <div className={styles.ImageCropAspectRatioMenu__chevron}>
            <Icon name="ChevronDown" size={24} />
          </div>
        </>
      }
      triggerAriaLabel={t(`${translationNameSpace}.aspectRatio`)}
      triggerClassName={styles.ImageCropAspectRatioMenu__trigger}
    >
      <MenuItem icon="CustomSize" label={t(`${translationNameSpace}.custom`)} selected={isCustomActive} />
      <MenuSeparator />
      <MenuItem
        icon="Image"
        label={t(`${translationNameSpace}.original`)}
        onClick={(): void => onSelectPreset(ASPECT_RATIO_ORIGINAL)}
        selected={isPresetActive(ASPECT_RATIO_ORIGINAL)}
      />
      <MenuItem
        icon="Square"
        label={t(`${translationNameSpace}.square`)}
        onClick={(): void => onSelectPreset(ASPECT_RATIO_SQUARE)}
        selected={isPresetActive(ASPECT_RATIO_SQUARE)}
      />
      <MenuItem
        icon="Circle"
        label={t(`${translationNameSpace}.circle`)}
        onClick={(): void => onSelectPreset(ASPECT_RATIO_CIRCLE)}
        selected={isPresetActive(ASPECT_RATIO_CIRCLE)}
      />
      <MenuSub icon="Landscape" label={t(`${translationNameSpace}.landscape`)} withCheck>
        <MenuItem
          label={t(`${translationNameSpace}.ratio16x9`)}
          onClick={(): void => onSelectPreset(ASPECT_RATIO_LANDSCAPE_16_9)}
          selected={isPresetActive(ASPECT_RATIO_LANDSCAPE_16_9)}
        />
        <MenuItem
          label={t(`${translationNameSpace}.ratio4x3`)}
          onClick={(): void => onSelectPreset(ASPECT_RATIO_LANDSCAPE_4_3)}
          selected={isPresetActive(ASPECT_RATIO_LANDSCAPE_4_3)}
        />
        <MenuItem
          label={t(`${translationNameSpace}.ratio3x2`)}
          onClick={(): void => onSelectPreset(ASPECT_RATIO_LANDSCAPE_3_2)}
          selected={isPresetActive(ASPECT_RATIO_LANDSCAPE_3_2)}
        />
      </MenuSub>
      <MenuSub icon="Portrait" label={t(`${translationNameSpace}.portrait`)} withCheck>
        <MenuItem
          label={t(`${translationNameSpace}.ratio9x16`)}
          onClick={(): void => onSelectPreset(ASPECT_RATIO_PORTRAIT_9_16)}
          selected={isPresetActive(ASPECT_RATIO_PORTRAIT_9_16)}
        />
        <MenuItem
          label={t(`${translationNameSpace}.ratio3x4`)}
          onClick={(): void => onSelectPreset(ASPECT_RATIO_PORTRAIT_3_4)}
          selected={isPresetActive(ASPECT_RATIO_PORTRAIT_3_4)}
        />
        <MenuItem
          label={t(`${translationNameSpace}.ratio2x3`)}
          onClick={(): void => onSelectPreset(ASPECT_RATIO_PORTRAIT_2_3)}
          selected={isPresetActive(ASPECT_RATIO_PORTRAIT_2_3)}
        />
      </MenuSub>
    </Menu>
  );
};

export default ImageCropAspectRatioMenu;
