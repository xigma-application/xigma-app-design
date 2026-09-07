import { Fragment } from 'react';
import { TFunction } from 'i18next';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';

// styles
import styles from '../column-alignment.module.scss';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TAlignmentOption } from '../types';
import { TButtonGroup } from 'shared/UITools/ButtonGroup/types';

export const buildAlignmentButtons = <K extends AlignmentHorizontal | AlignmentVertical>(
  options: TAlignmentOption[],
  disabled: boolean,
  selectedKey: K | undefined,
  onSelect: TFunc<[K]>,
  t: TFunction,
): TButtonGroup[] =>
  options.map(({ key, labelKey, name, shortcutKey }) => ({
    active: key === selectedKey,
    ariaLabel: t(labelKey),
    disabled,
    name,
    onClick: (): void => onSelect(key as K),
    tooltip: (
      <Fragment>
        {t(labelKey)}
        <span className={styles.ColumnAlignment__shortcut}>{KEYBOARD_SHORTCUTS[shortcutKey].join('')}</span>
      </Fragment>
    ),
  }));
