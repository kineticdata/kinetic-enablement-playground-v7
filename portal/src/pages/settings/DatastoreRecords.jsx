import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CoreForm,
  deleteSubmission,
  searchSubmissions,
} from '@kineticdata/react';
import { useData } from '../../helpers/hooks/useData.js';
import { Loading as Pending } from '../../components/states/Loading.jsx';
import { TableComponent } from '../../components/kinetic-form/widgets/table.js';
import { toastError, toastSuccess } from '../../helpers/toasts.js';
import clsx from 'clsx';
import { Error } from '../../components/states/Error.jsx';
import { openConfirm } from '../../helpers/confirm.js';
import { callIfFn } from '../../helpers/index.js';
import { useSelector } from 'react-redux';
import { PageHeading } from '../../components/PageHeading.jsx';

const idToHandle = id =>
  !id ? null : id.toLowerCase() === 'new' ? 'New' : id.slice(-6).toUpperCase();

const rowTransform = ({ values, ...row }) => ({
  ...values,
  ...Object.fromEntries(Object.entries(row).map(([k, v]) => [`_${k}`, v])),
});

const dateFormat = dateString => format(new Date(dateString), 'PPPp');

export const DatastoreRecords = ({ datastores }) => {
  const { formSlug, id } = useParams();
  const navigate = useNavigate();
  const { kappSlug } = useSelector(state => state.app);
  const datastore = datastores?.find(form => form.slug === formSlug);

  const params = useMemo(
    () => ({
      kapp: kappSlug,
      form: formSlug,
      search: {
        include: ['details', 'values'],
        limit: 1000,
      },
    }),
    [kappSlug, formSlug],
  );

  const {
    initialized,
    loading,
    response,
    actions: { reloadData },
  } = useData(searchSubmissions, params);

  const handleCreated = useCallback(
    response => {
      reloadData();
      if (response.submission.coreState !== 'Submitted') {
        navigate(`./../${response.submission.id}`, {
          state: { persistToasts: true },
        });
      }
      if (response.submission.coreState === 'Draft') {
        toastSuccess({ title: 'Saved successfully.' });
      }
    },
    [navigate, reloadData],
  );

  const handleUpdated = useCallback(
    response => {
      reloadData();
      if (response.submission.coreState === 'Draft') {
        toastSuccess({ title: 'Saved successfully.' });
      } else {
        navigate('./..', { state: { persistToasts: true } });
      }
    },
    [navigate, reloadData],
  );

  const handleCompleted = useCallback(() => {
    reloadData();
    toastSuccess({ title: 'Saved successfully.' });
    navigate('./..', { state: { persistToasts: true } });
  }, [navigate, reloadData]);

  const isLoading = !datastores || !initialized || (loading && !response);
  const showForm = typeof id === 'string';

  return (
    <div className="max-w-screen-lg full-form:max-w-full pt-1 pb-6">
      <PageHeading
        title={['Settings', 'Datastore', datastore?.name, idToHandle(id)]
          .filter(Boolean)
          .join(' / ')}
      />

      {isLoading ? (
        <Pending />
      ) : (
        <>
          {showForm && (
            <div className="rounded-box md:border md:p-8">
              <CoreForm
                submission={id !== 'new' ? id : undefined}
                kapp={kappSlug}
                form={formSlug}
                components={{ Pending }}
                created={handleCreated}
                updated={handleUpdated}
                completed={handleCompleted}
                review={!datastore?.authorization?.Modification}
              />
            </div>
          )}

          {response.error || !datastore ? (
            <Error
              error={
                response.error || {
                  message: `Unable to locate the ${formSlug} Form.`,
                }
              }
            />
          ) : (
            <div className={clsx('', { hidden: showForm })}>
              <TableComponent
                data={response.submissions}
                rowTransform={rowTransform}
                columns={[
                  { label: 'Handle', property: '_handle' },
                  { label: 'Label', property: '_label' },
                  { label: 'Core State', property: '_coreState' },
                  ...datastore.fields.map(field => ({
                    label: field.name,
                    property: field.name,
                    visible: false,
                  })),
                  { label: 'ID', property: '_id', visible: false },
                  {
                    label: 'Created',
                    property: '_createdAt',
                    displayTransform: dateFormat,
                  },
                  {
                    label: 'Created By',
                    property: '_createdBy',
                    visible: false,
                  },
                  {
                    label: 'Updated',
                    property: '_updatedAt',
                    visible: false,
                    displayTransform: dateFormat,
                  },
                  {
                    label: 'Updated By',
                    property: '_updatedBy',
                    visible: false,
                  },
                  {
                    label: 'Submitted',
                    property: '_submittedAt',
                    visible: false,
                    displayTransform: dateFormat,
                  },
                  {
                    label: 'Submitted By',
                    property: '_submittedBy',
                    visible: false,
                  },
                  {
                    label: 'Closed',
                    property: '_closedAt',
                    visible: false,
                    displayTransform: dateFormat,
                  },
                  { label: 'Closed By', property: '_closedBy', visible: false },
                ]}
                addAction={
                  datastore.authorization.Display
                    ? {
                        label: 'New Row',
                        onClick: () => navigate('new'),
                      }
                    : undefined
                }
                selectAction={{
                  label: 'View Row',
                  onClick: row => navigate(row._id),
                }}
                rowActions={
                  datastore.authorization.Modification
                    ? [
                        {
                          label: 'Delete Row',
                          icon: 'trash',
                          onClick: row =>
                            openConfirm({
                              title: 'Delete Row',
                              description: `Are you sure you want to delete row ${row._handle}?`,
                              acceptLabel: 'Delete',
                              accept: () =>
                                deleteSubmission({ id: row._id }).then(
                                  ({ error }) => {
                                    if (error) {
                                      toastError({
                                        title: 'Delete Failed',
                                        description: error.message,
                                      });
                                    } else {
                                      toastSuccess({
                                        title: 'Row was deleted successfully',
                                      });
                                      callIfFn(reloadData);
                                    }
                                  },
                                ),
                            }),
                        },
                      ]
                    : undefined
                }
                allowExport={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
