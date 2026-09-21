import cx from 'classnames';
import { FC, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import SelectionColorPreview from './SelectionColorPreview/SelectionColorPreview';
import { Icon } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './selection-colors-section-header.module.scss';

// types
import { TSelectionColorGroup } from '../types';

export type TSelectionColorsSectionHeaderProps = {
  groups: TSelectionColorGroup[];
  isExpanded: boolean;
  onToggleClick: TFunc;
  onToggleKeyDown: TFunc<[KeyboardEvent<HTMLElement>]>;
};

export const SelectionColorsSectionHeader: FC<TSelectionColorsSectionHeaderProps> = ({
  groups,
  isExpanded,
  onToggleClick,
  onToggleKeyDown,
}) => {
  const { t } = useTranslation();

  return (
    <div
      aria-expanded={isExpanded}
      className={cx(styles.SelectionColorsSectionHeader, { [styles['SelectionColorsSectionHeader--muted']]: !isExpanded })}
      onClick={onToggleClick}
      onKeyDown={onToggleKeyDown}
      role="button"
      tabIndex={0}
    >
      <span
        className={cx(styles.SelectionColorsSectionHeader__chevron, {
          [styles['SelectionColorsSectionHeader__chevron--expanded']]: isExpanded,
        })}
      >
        <Icon color="neutral2" name="ChevronRight" size={12} />
      </span>
      <span className={styles.SelectionColorsSectionHeader__label}>{t(`${translationNameSpace}.label`)}</span>
      {!isExpanded && <SelectionColorPreview groups={groups} />}
    </div>
  );
};

export default SelectionColorsSectionHeader;
