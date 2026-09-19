import cx from 'classnames';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { getStrokeSidesIcon } from '../utils/getStrokeSidesIcon';
import { getStrokeSidesTriggerIcon } from '../utils/getStrokeSidesTriggerIcon';
import { STROKE_SIDES_ORDER } from '../constants';
import { translationNameSpace } from '../../constants';

// styles
import styles from './stroke-sides-menu.module.scss';

// types
import { StrokeSides } from 'types/design/enums';

export type TStrokeSidesMenuProps = {
  hidden?: boolean;
  onSelect: TFunc<[StrokeSides]>;
  sides: StrokeSides;
};

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

const StrokeSidesMenu: FC<TStrokeSidesMenuProps> = ({ hidden = false, onSelect, sides }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <UITools.Popover
      align="end"
      asChild
      onOpenChange={setIsOpen}
      trigger={
        <UITools.ButtonIcon
          aria-hidden={hidden}
          className={cx({ [styles['StrokeSidesMenu__trigger--hidden']]: hidden })}
          disabled={hidden}
          ariaLabel={t(`${translationNameSpace}.individualStrokesAriaLabel`)}
          name={getStrokeSidesTriggerIcon(sides)}
          selected={isOpen}
        />
      }
      triggerTooltip={t(`${translationNameSpace}.individualStrokesTooltip`)}
    >
      {STROKE_SIDES_ORDER.map((option) => (
        <div key={option}>
          {option === StrokeSides.custom && <PopoverSeparator />}
          <PopoverItem
            icon={getStrokeSidesIcon(option)}
            iconSize={24}
            label={t(`${translationNameSpace}.sides.options.${option}`)}
            onClick={() => onSelect(option)}
            selected={option === sides}
          />
        </div>
      ))}
    </UITools.Popover>
  );
};

export default StrokeSidesMenu;
