import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon, Tooltip } from '@xigma/components';

// components
import FillWeightMenu from './FillWeightMenu/FillWeightMenu';
import GridTrackHandle from './GridTrackHandle';
import { UITools } from 'shared';

// hooks
import { TGridTrackSelectModifiers } from '../hooks/useGridTrackSelection';
import { TGridTrackViewModel } from '../../hooks/types';
import { useBeginTrackHandleDrag } from './hooks/useBeginTrackHandleDrag';
import { useCommitFillTrackValue } from './hooks/useCommitFillTrackValue';
import { useCommitHugTrackAsFixed } from './hooks/useCommitHugTrackAsFixed';
import { useCommitTrackMode } from './hooks/useCommitTrackMode';
import { useCommitTrackValueOnBlur } from './hooks/useCommitTrackValueOnBlur';
import { useHandleTrackValueClick } from './hooks/useHandleTrackValueClick';
import { useSelectTrackNumberPortion } from './hooks/useSelectTrackNumberPortion';
import { useSelectTrackRow } from './hooks/useSelectTrackRow';
import { useStopRowSelectPropagation } from './hooks/useStopRowSelectPropagation';

// others
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';
import { getRemoveTrackTooltip } from './utils/getRemoveTrackTooltip';
import { getTrackModeOptions } from './utils/getTrackModeOptions';
import { getTrackValueFieldText } from './utils/getTrackValueFieldText';
import { getValueBlurHandlerByMode } from './utils/getValueBlurHandlerByMode';
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
  onChangeMode: (mode: SizingMode, value?: number) => void;
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
  const isFill = track.mode === SizingMode.fill;
  const handleClick = useSelectTrackRow(onSelect);
  const handleBlur = useCommitTrackValueOnBlur(onChangeValue);
  const handleHugBlur = useCommitHugTrackAsFixed(onChangeMode);
  const handleFillBlur = useCommitFillTrackValue(onChangeMode, onChangeValue);
  const handlePointerDown = useBeginTrackHandleDrag(onSelect, onStartDrag);
  const { inputRef, selectNumberPortion } = useSelectTrackNumberPortion();
  const removeTooltip = getRemoveTrackTooltip(t, axis, track, trackCount, isSelected, selectedCount);
  const trackModeOptions = getTrackModeOptions(t, track, axis);
  const valueBlurHandlerByMode = getValueBlurHandlerByMode(handleFillBlur, handleBlur, handleHugBlur);
  const handleModeSelect = useCommitTrackMode(onChangeMode, track.resolvedSize);
  const stopRowSelectPropagation = useStopRowSelectPropagation();
  const handleValueClick = useHandleTrackValueClick(isFill, selectNumberPortion);

  return (
    <div
      className={cx(styles.GridTrackRow, { [styles['GridTrackRow--selected']]: isSelected })}
      onClick={handleClick}
      ref={registerRow}
      {...getAttributes(E2EAttribute.gridTrackRow, String(track.index))}
    >
      <GridTrackHandle index={track.index} isDragging={isDragging} isSelected={isSelected} onPointerDown={handlePointerDown} />
      <span onClick={stopRowSelectPropagation} style={{ display: 'contents' }}>
        <UITools.Dropdown
          bypassGlobalShortcuts={false}
          className={styles.GridTrackRow__mode}
          onSelect={handleModeSelect}
          options={trackModeOptions}
          value={track.mode}
          variant="outline"
        />
      </span>
      <UITools.TextField
        aria-label={t(`${translationNameSpace}.trackValueAriaLabel`)}
        bypassGlobalShortcuts={false}
        className={cx(styles.GridTrackRow__value, { [styles['GridTrackRow__value--hug']]: isHug })}
        defaultValue={getTrackValueFieldText(track)}
        e2eValue={`${E2EAttribute.gridTrackValue}-${track.index}`}
        endAdornment={isFill ? <FillWeightMenu onSelect={onChangeValue} value={track.value} /> : undefined}
        inputRef={inputRef}
        onBlur={valueBlurHandlerByMode[track.mode]}
        onClick={handleValueClick}
        onFocus={isFill ? selectNumberPortion : undefined}
        type={isFill ? 'text' : 'number'}
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
