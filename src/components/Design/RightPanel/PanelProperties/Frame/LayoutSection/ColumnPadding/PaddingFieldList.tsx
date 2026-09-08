import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PaddingInput from './PaddingInput';

// others
import { translationNameSpace } from './constants';

// types
import { TPaddingField } from './hooks/useColumnPadding/types';

export type TPaddingFieldListProps = {
  fields: TPaddingField[];
};

const PaddingFieldList: FC<TPaddingFieldListProps> = ({ fields }) => {
  const { t } = useTranslation();

  return (
    <>
      {fields.map((field) => (
        <PaddingInput
          ariaLabel={t(`${translationNameSpace}.ariaLabel.${field.labelKey}`)}
          e2eValue={field.e2eValue}
          iconName={field.iconName}
          key={field.e2eValue}
          onCommit={field.onCommit}
          onScrub={field.onScrub}
          scrubValue={field.scrubValue}
          tooltip={t(`${translationNameSpace}.tooltip.${field.labelKey}`)}
          value={field.value}
        />
      ))}
    </>
  );
};

export default PaddingFieldList;
