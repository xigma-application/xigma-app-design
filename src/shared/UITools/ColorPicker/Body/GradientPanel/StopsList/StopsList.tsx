import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StopRow from './StopRow/StopRow';
import { Icon, Tooltip, UITools } from 'shared';

// others
import { ADD_STOP_POSITION } from './constants';

// styles
import styles from './stops-list.module.scss';

// types
import { TColorPickerValue } from '../../../types';
import { TEditableGradientStop } from '../types';

export type TStopsListProps = {
  canAddStop: boolean;
  canRemoveStop: boolean;
  onAddStop: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onRemoveStop: TFunc<[string]>;
  onSelectStop: TFunc<[string]>;
  onSetStopColor: TFunc<[string, TColorPickerValue]>;
  onSetStopPosition: TFunc<[string, number]>;
  selectedStopId: string | null;
  stops: TEditableGradientStop[];
};

export const StopsList: FC<TStopsListProps> = ({
  canAddStop,
  canRemoveStop,
  onAddStop,
  onDragEnd,
  onDragStart,
  onRemoveStop,
  onSelectStop,
  onSetStopColor,
  onSetStopPosition,
  selectedStopId,
  stops,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.StopsList}>
      <div className={styles.StopsList__header}>
        <span>{t('colorPicker.gradient.stops.title')}</span>
        <Tooltip content={t('colorPicker.gradient.stops.addAriaLabel')}>
          <UITools.Button
            ariaLabel={t('colorPicker.gradient.stops.addAriaLabel')}
            disabled={!canAddStop}
            onClick={(): void => onAddStop(ADD_STOP_POSITION)}
            style={{ padding: 0 }}
          >
            <Icon name="Plus" size={24} />
          </UITools.Button>
        </Tooltip>
      </div>
      {stops.map((stop) => (
        <StopRow
          canRemove={canRemoveStop}
          isSelected={selectedStopId === stop.id}
          key={stop.id}
          onColorChange={(value): void => onSetStopColor(stop.id, value)}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onPositionChange={(position): void => onSetStopPosition(stop.id, position)}
          onRemove={(): void => onRemoveStop(stop.id)}
          onSelect={(): void => onSelectStop(stop.id)}
          stop={stop}
        />
      ))}
    </div>
  );
};

export default StopsList;
