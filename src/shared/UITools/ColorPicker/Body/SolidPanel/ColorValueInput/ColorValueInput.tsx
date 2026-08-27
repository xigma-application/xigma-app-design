import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AlphaField from './AlphaField/AlphaField';
import { Dropdown, FieldGroup } from 'shared';

// others
import { DEFAULT_FORMAT, FORMAT_LABEL_KEY, FORMAT_ORDER } from './constants';

// styles
import styles from './color-value-input.module.scss';

// types
import { ColorFormat } from './enums';
import { TUseColorModelResult } from '../../../hooks/useColorModel';

// utils
import { hexToRgb } from 'utils/color/hexToRgb';
import { renderValueField } from './utils/renderValueField';

export type TColorValueInputProps = { alpha: number; colorModel: TUseColorModelResult };

export const ColorValueInput: FC<TColorValueInputProps> = ({ alpha, colorModel }) => {
  const { t } = useTranslation();
  const [format, setFormat] = useState(DEFAULT_FORMAT);
  const rgb = hexToRgb(colorModel.hex);
  const formatOptions = FORMAT_ORDER.map((formatOption) => ({ label: t(FORMAT_LABEL_KEY[formatOption]), value: formatOption }));

  return (
    <div className={styles.ColorValueInput}>
      <Dropdown className={styles.ColorValueInput__formatTrigger} onSelect={setFormat} options={formatOptions} value={format} />
      <FieldGroup>
        {renderValueField(format, alpha, colorModel, rgb)}
        {format !== ColorFormat.css && <AlphaField alpha={alpha} onCommit={colorModel.setAlpha} />}
      </FieldGroup>
    </div>
  );
};

export default ColorValueInput;
