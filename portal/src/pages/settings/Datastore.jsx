import { useSelector } from 'react-redux';
import { Loading } from '../../components/states/Loading.jsx';
import { SettingsCard } from './Settings.jsx';
import { PageHeading } from '../../components/PageHeading.jsx';

export const Datastore = ({ datastores }) => {
  const mobile = useSelector(state => state.view.mobile);

  return (
    <div className="max-w-screen-lg pt-1 pb-6">
      <PageHeading title="Settings / Datastore" />

      <div className="flex flex-col gap-4 mb-4 md:mb-6 md:grid md:grid-cols-[auto_auto_1fr]">
        {!datastores ? (
          mobile ? (
            <Loading xsmall size={36} />
          ) : (
            <Loading className="col-start-1 col-end-5" />
          )
        ) : (
          datastores.map(form => (
            <SettingsCard
              key={form.slug}
              label={form.name}
              description={form.description}
              icon={form.attributesMap['Icon']?.[0]}
              to={form.slug}
            />
          ))
        )}
      </div>
    </div>
  );
};
