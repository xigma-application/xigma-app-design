import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { ICON_SIZE, MORE_TOOLS } from '../../constants';

const { PopoverItem } = UITools.PopoverCompound;

const ImageEditMoreDropdownItems: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      {MORE_TOOLS.map((tool) => (
        <PopoverItem icon={tool.icon} iconSize={ICON_SIZE} key={tool.labelKey} label={t(tool.labelKey)} withCheck={false} />
      ))}
    </Fragment>
  );
};

export default ImageEditMoreDropdownItems;
