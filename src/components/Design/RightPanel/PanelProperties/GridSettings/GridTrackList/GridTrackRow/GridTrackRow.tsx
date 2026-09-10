import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import GridTrackHandle from './GridTrackHandle';
import { UITools } from 'shared';

// hooks
import { TGridTrackSelectModifiers } from '../hooks/useGridTrackSelection';
import { TGridTrackViewModel } from '../../hooks/types';
import { useCommitTrackValueOnBlur } from './hooks/useCommitTrackValueOnBlur';
import { useSelectTrackRow } from './hooks/useSelectTrackRow';

// others
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';
import { translationNameSpace } from '../../constants';

// styles
import styles from './grid-track-row.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { SizingMode } from 'types/design/enums';

export type TGridTrackRowProps = {
  canDelete: boolean;
  isDragging: boolean;
  isSelected: boolean;
  onChangeMode: TFunc<[SizingMode]>;
  onChangeValue: TFunc<[number]>;
  onDelete: TFunc;
  onSelect: TFunc<[TGridTrackSelectModifiers]>;
  onStartDrag: TFunc<[ReactPointerEvent]>;
  registerRow: (element: HTMLElement | null) => void;
  track: TGridTrackViewModel;
};

export const GridTrackRow: FC<TGridTrackRowProps> = ({
  canDelete,
  isDragging,
  isSelected,
  onChangeMode,
  onChangeValue,
  onDelete,
  onSelect,
  onStartDrag,
  registerRow,
  track,
}) => {
  const { t } = useTranslation();
  const isHug = track.mode === SizingMode.hug;
  const handleClick = useSelectTrackRow(onSelect);
  const handleBlur = useCommitTrackValueOnBlur(onChangeValue);
  const modeOptions = [SizingMode.fill, SizingMode.fixed, SizingMode.hug].map((mode) => ({
    label: t(`${translationNameSpace}.mode.${mode}`),
    value: mode,
  }));

  return (
    <div
      className={cx(styles.GridTrackRow, {
        [styles['GridTrackRow--dragging']]: isDragging,
        [styles['GridTrackRow--selected']]: isSelected,
      })}
      onClick={handleClick}
      ref={registerRow}
      {...getAttributes(E2EAttribute.gridTrackRow, String(track.index))}
    >
      <GridTrackHandle index={track.index} isDragging={isDragging} isSelected={isSelected} onPointerDown={onStartDrag} />
      <UITools.Dropdown
        bypassGlobalShortcuts={false}
        className={styles.GridTrackRow__mode}
        onSelect={onChangeMode}
        options={modeOptions}
        value={track.mode}
        variant="outline"
      />
      <UITools.TextField
        aria-label={t(`${translationNameSpace}.trackValueAriaLabel`)}
        bypassGlobalShortcuts={false}
        className={styles.GridTrackRow__value}
        defaultValue={isHug ? '' : String(track.value)}
        disabled={isHug}
        e2eValue={`${E2EAttribute.gridTrackValue}-${track.index}`}
        endAdornment={
          <UITools.ButtonMenu
            trigger={<Icon name="ChevronDown" size={10} />}
            triggerAriaLabel={t(`${translationNameSpace}.trackModeAriaLabel`)}
          >
            {modeOptions.map((option) => (
              <UITools.PopoverCompound.PopoverItem
                key={option.value}
                label={option.label}
                onClick={() => onChangeMode(option.value)}
                selected={option.value === track.mode}
              />
            ))}
          </UITools.ButtonMenu>
        }
        onBlur={handleBlur}
        type="number"
      />
      <UITools.Button
        ariaLabel={t(`${translationNameSpace}.deleteAriaLabel`)}
        className={styles.GridTrackRow__delete}
        disabled={!canDelete}
        onClick={onDelete}
        style={{ padding: 2 }}
      >
        <Icon name="Minus" size={12} />
      </UITools.Button>
    </div>
  );
};

export default GridTrackRow;
