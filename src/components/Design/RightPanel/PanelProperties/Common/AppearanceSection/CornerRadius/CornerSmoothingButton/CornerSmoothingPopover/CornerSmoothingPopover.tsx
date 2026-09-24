import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import CornerSmoothingPopoverHeader from './CornerSmoothingPopoverHeader/CornerSmoothingPopoverHeader';
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';
import { UITools } from 'shared';

// hooks
import { useCornerSmoothingPopover } from './hooks/useCornerSmoothingPopover';

// others
import { IOS_SMOOTHING_VALUE, SMOOTHING_MAX, SMOOTHING_MIN } from './constants';
import { translationNameSpace } from '../../../constants';

// styles
import styles from './corner-smoothing-popover.module.scss';

export type TCornerSmoothingPopoverProps = {
  onClose: TFunc;
};

export const CornerSmoothingPopover: FC<TCornerSmoothingPopoverProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { displayValue, onBlur, onSliderChange, value } = useCornerSmoothingPopover();

  return (
    <div className={styles.CornerSmoothingPopover}>
      <CornerSmoothingPopoverHeader onClose={onClose} />
      <div className={styles.CornerSmoothingPopover__row}>
        <UITools.Slider
          ariaLabel={t(`${translationNameSpace}.cornerRadius.smoothingValueAriaLabel`)}
          className={styles.CornerSmoothingPopover__slider}
          marks={[{ label: t(`${translationNameSpace}.cornerRadius.smoothingPreviewIos`), value: IOS_SMOOTHING_VALUE }]}
          max={100}
          min={0}
          onChange={onSliderChange}
          value={value}
        />
        <TextFieldWrapper
          aria-label={t(`${translationNameSpace}.cornerRadius.smoothingValueAriaLabel`)}
          className={styles.CornerSmoothingPopover__input}
          defaultValue={displayValue}
          e2eValue="corner-smoothing"
          onBlur={onBlur}
          stepNumbers={{ max: SMOOTHING_MAX, min: SMOOTHING_MIN }}
          type="text"
        />
      </div>
    </div>
  );
};

export default CornerSmoothingPopover;
