import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { Menu, MenuCompound } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './image-crop-aspect-ratio-menu.module.scss';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

const ImageCropAspectRatioMenu: FC = () => {
  const { t } = useTranslation();

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
      <MenuItem icon="CustomSize" label={t(`${translationNameSpace}.custom`)} withCheck={false} />
      <MenuSeparator />
      <MenuItem icon="Image" label={t(`${translationNameSpace}.original`)} withCheck={false} />
      <MenuItem icon="Square" label={t(`${translationNameSpace}.square`)} withCheck={false} />
      <MenuItem icon="Circle" label={t(`${translationNameSpace}.circle`)} withCheck={false} />
      <MenuSub icon="Landscape" label={t(`${translationNameSpace}.landscape`)} withCheck={false}>
        <MenuItem label={t(`${translationNameSpace}.ratio16x9`)} withCheck={false} />
        <MenuItem label={t(`${translationNameSpace}.ratio4x3`)} withCheck={false} />
        <MenuItem label={t(`${translationNameSpace}.ratio3x2`)} withCheck={false} />
      </MenuSub>
      <MenuSub icon="Portrait" label={t(`${translationNameSpace}.portrait`)} withCheck={false}>
        <MenuItem label={t(`${translationNameSpace}.ratio9x16`)} />
        <MenuItem label={t(`${translationNameSpace}.ratio3x4`)} selected />
        <MenuItem label={t(`${translationNameSpace}.ratio2x3`)} />
      </MenuSub>
    </Menu>
  );
};

export default ImageCropAspectRatioMenu;
