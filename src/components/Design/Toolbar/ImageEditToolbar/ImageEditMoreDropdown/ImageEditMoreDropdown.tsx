import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ImageEditMoreDropdownItems from './ImageEditMoreDropdownItems/ImageEditMoreDropdownItems';
import ToolbarDropdown from '../../ToolbarDropdown/ToolbarDropdown';

// others
import { translationNameSpace } from '../constants';

const ImageEditMoreDropdown: FC = () => {
  const { t } = useTranslation();
  const label = t(`${translationNameSpace}.more`);

  return (
    <ToolbarDropdown option={null} placeholderLabel={label} triggerAriaLabel={label}>
      <ImageEditMoreDropdownItems />
    </ToolbarDropdown>
  );
};

export default ImageEditMoreDropdown;
