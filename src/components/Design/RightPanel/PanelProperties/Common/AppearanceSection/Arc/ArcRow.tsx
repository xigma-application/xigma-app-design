import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ArcField from './ArcField';
import { UITools } from 'shared';

// hooks
import { useEllipseArc } from './hooks/useEllipseArc';

// others
import { translationNameSpace } from '../constants';

const ArcRow: FC = () => {
  const { t } = useTranslation();
  const fields = useEllipseArc();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.single} labels={[t(`${translationNameSpace}.arc.label`)]}>
      <UITools.FieldGroup>
        {fields.map((field, index) => (
          <ArcField ariaLabel={t(`${translationNameSpace}.arc.${field.key}`)} field={field} key={field.key} withIcon={index === 0} />
        ))}
      </UITools.FieldGroup>
    </UITools.SectionColumn>
  );
};

export default ArcRow;
