import { Route, Routes } from 'react-router-dom';
import { fetchForms } from '@kineticdata/react';
import { Settings } from './Settings.jsx';
import { useData } from '../../helpers/hooks/useData.js';
import { sortBy } from '../../helpers/index.js';
import { SettingsForm } from './SettingsForm.jsx';
import { Datastore } from './Datastore.jsx';
import { DatastoreRecords } from './DatastoreRecords.jsx';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { Notifications } from './Notifications.jsx';

export const SettingsRouting = () => {
  const kappSlug = useSelector(state => state.app.kappSlug);

  // Retrieve all settings forms
  const settingsFormsParams = useMemo(
    () => ({
      kappSlug,
      include: 'attributesMap',
      q: 'type = "Settings" AND (status = "Active" OR status = "New")',
    }),
    [kappSlug],
  );
  const settingsForms = useData(fetchForms, settingsFormsParams);

  // Retrieve all datastore forms
  const datastoreFormsParams = useMemo(
    () => ({
      kappSlug,
      include: 'attributesMap,authorization,fields',
      q: 'type = "Datastore" AND (status = "Active" OR status = "New")',
    }),
    [kappSlug],
  );
  const datastoreForms = useData(fetchForms, datastoreFormsParams);

  const datastores =
    datastoreForms.initialized && !datastoreForms.loading
      ? datastoreForms?.response?.forms || []
      : null;

  const settings =
    settingsForms.initialized && !settingsForms.loading && datastores
      ? [
          datastores?.length > 0 && {
            label: 'Datastore',
            description: 'Management of referential and configuration data.',
            icon: 'forms',
            to: 'datastore',
          },
          {
            label: 'Profile',
            description: 'Management of your user profile.',
            icon: 'user',
            to: '/profile',
            state: { backPath: '/settings' },
          },
          {
            label: 'Notifications',
            description: 'Management of your Notifications.',
            icon: 'bell',
            to: 'notifications',
            state: { backPath: '/settings' },
          },
          ...(settingsForms?.response?.forms?.map(form => ({
            label: form.name,
            description: form.description,
            icon: form.attributesMap['Icon']?.[0],
            to: form.slug,
          })) || []),
        ]
          .filter(Boolean)
          .sort(sortBy('label'))
      : null;

  return (
    <div className="gutter">
      <Routes>
        <Route path="/" element={<Settings settings={settings} />} />
        <Route
          path="/datastore"
          element={<Datastore datastores={datastores} />}
        />
        <Route path="/notifications" element={<Notifications />} />
        <Route
          path="/datastore/:formSlug/:id?"
          element={<DatastoreRecords datastores={datastores} />}
        />
        <Route path="/:formSlug" element={<SettingsForm />} />
      </Routes>
    </div>
  );
};
