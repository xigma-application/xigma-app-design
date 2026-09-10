import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon, Tooltip } from '@xigma/components';

// components
import GridTrackHandle from './GridTrackHandle';
import { UITools } from 'shared';

// hooks
import { TGridTrackSelectModifiers } from '../hooks/useGridTrackSelection';
import { TGridTrackViewModel } from '../../hooks/types';
import { useBeginTrackHandleDrag } from './hooks/useBeginTrackHandleDrag';
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
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export type TGridTrackRowProps = {
  axis: TGridTrackAxis;
  canDelete: boolean;
  isDragging: boolean;
  isSelected: boolean;
  onChangeMode: TFunc<[SizingMode]>;
  onChangeValue: TFunc<[number]>;
  onDelete: TFunc;
  onSelect: TFunc<[TGridTrackSelectModifiers]>;
  onStartDrag: TFunc<[ReactPointerEvent]>;
  registerRow: (element: HTMLElement | null) => void;
  selectedCount: number;
  track: TGridTrackViewModel;
  trackCount: number;
};

export const GridTrackRow: FC<TGridTrackRowProps> = ({
  axis,
  canDelete,
  isDragging,
  isSelected,
  onChangeMode,
  onChangeValue,
  onDelete,
  onSelect,
  onStartDrag,
  registerRow,
  selectedCount,
  track,
  trackCount,
}) => {
  const { t } = useTranslation();
  const isHug = track.mode === SizingMode.hug;
  const axisKey = axis === 'column' ? 'Column' : 'Row';
  const isBulkRemove = isSelected && selectedCount > 1;
  const handleClick = useSelectTrackRow(onSelect);
  const handleBlur = useCommitTrackValueOnBlur(onChangeValue);
  const handlePointerDown = useBeginTrackHandleDrag(onSelect, onStartDrag);
  const removeTooltip = isBulkRemove
    ? t(`${translationNameSpace}.remove${axisKey}sTooltip`, { count: selectedCount })
    : t(`${translationNameSpace}.remove${axisKey}Tooltip`, { position: track.index + 1, total: trackCount });
  const modeOptions = [SizingMode.fill, SizingMode.fixed, SizingMode.hug].map((mode) => ({
    label: t(`${translationNameSpace}.mode.${mode}`),
    value: mode,
  }));

  return (
    <div
      className={cx(styles.GridTrackRow, { [styles['GridTrackRow--selected']]: isSelected })}
      onClick={handleClick}
      ref={registerRow}
      {...getAttributes(E2EAttribute.gridTrackRow, String(track.index))}
    >
      <GridTrackHandle index={track.index} isDragging={isDragging} isSelected={isSelected} onPointerDown={handlePointerDown} />
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
      <Tooltip align="end" content={removeTooltip}>
        <UITools.Button
          ariaLabel={t(`${translationNameSpace}.deleteAriaLabel`)}
          className={styles.GridTrackRow__delete}
          disabled={!canDelete}
          onClick={onDelete}
          style={{ padding: 2 }}
        >
          <Icon name="Minus" size={12} />
        </UITools.Button>
      </Tooltip>
    </div>
  );
};

export default GridTrackRow;
