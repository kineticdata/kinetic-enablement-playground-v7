import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CoreForm } from '@kineticdata/react';
import { Loading as Pending } from '../../components/states/Loading.jsx';
import { valuesFromQueryParams } from '../../helpers/index.js';
import { useSelector } from 'react-redux';
import { PageHeading } from '../../components/PageHeading.jsx';

export const SettingsForm = () => {
  const [form, setForm] = useState('');
  const { formSlug } = useParams();
  const [searchParams] = useSearchParams();
  const paramFieldValues = valuesFromQueryParams(searchParams);
  const { kappSlug } = useSelector(state => state.app);

  return (
    <div className="max-w-screen-lg full-form:max-w-full pt-1 pb-6">
      <PageHeading
        title={['Settings', form?.name?.()].filter(Boolean).join(' / ')}
      />

      <CoreForm
        kapp={kappSlug}
        form={formSlug}
        values={paramFieldValues}
        components={{ Pending }}
        loaded={setForm}
      />
    </div>
  );
};
