import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { PageHeading } from '../../components/PageHeading.jsx';
import { TableComponent } from '../../components/kinetic-form/widgets/table.js';
import { Modal } from '../../atoms/Modal.jsx';
import { toastError, toastSuccess } from '../../helpers/toasts.js';
import clsx from 'clsx';
import { openConfirm } from '../../helpers/confirm.js';
import { deleteSubmission } from '@kineticdata/react';

// Transform the data to a single level map
const rowTransform = ({ Values, ...row }) => ({ ...row, ...Values });

const mapSubmissionToRow = (templateType, submission) => {
  const { values, id } = submission;

  return {
    id,
    status: values['status'],
    name: values['name'],
    format: values['format'],
  };
};

export const Notifications = () => {
  const { kappSlug } = useSelector(state => state.app);
  const [activeTab, setActiveTab] = useState('Templates');
  const [previewModal, setPreviewModal] = useState({
    open: false,
    title: '',
    htmlContent: '',
    loading: false,
  });

  const closePreviewModal = () => {
    setPreviewModal({
      open: false,
      title: '',
      htmlContent: '',
      loading: false,
    });
  };

  const previewTemplate = row => {
    setPreviewModal({
      open: true,
      title: `Preview: ${row.name}`,
      htmlContent: row.format || '',
      loading: false,
    });
  };

  const templatesIntegration = useMemo(
    () => ({
      kappSlug,
      integrationName: 'Notification Templates',
      listProperty: 'submissions',
      errorProperty: 'Error',
    }),
    [kappSlug],
  );
  const snippetsIntegration = useMemo(
    () => ({
      kappSlug,
      integrationName: 'Notification Snippets',
      listProperty: 'submissions',
      errorProperty: 'Error',
    }),
    [kappSlug],
  );
  const dateFormatsIntegration = useMemo(
    () => ({
      kappSlug,
      integrationName: 'Notification Date Formats',
      listProperty: 'submissions',
      errorProperty: 'Error',
    }),
    [kappSlug],
  );

  const createAddAction = (templateType, formSlug) => ({
    label: `Add ${templateType}`,
    onClick: function (tableApi) {
      tableApi.actions.subform({
        config: {
          kappSlug,
          formSlug,
          modalTitle: `Add ${templateType}`,
          modalSize: 'lg',
          saveLabel: 'Create',
          values:
            templateType !== 'Date Format' ? { Type: templateType } : undefined,
          onSave: function (_, api) {
            api.submit(function (result) {
              // Add row to the table so it appears immediately before the table reloads
              const newRow = mapSubmissionToRow(
                templateType,
                result.submission,
              );
              tableApi.addRow(newRow);
              // Reload the table data in the background
              tableApi.reloadData();
              toastSuccess({ title: `${templateType} added successfully` });
              api.destroy();
            });
          },
        },
      });
    },
  });

  const createRowActions = templateType => [
    {
      label: `Preview ${templateType}`,
      icon: 'eye',
      onClick: function (row) {
        previewTemplate(row);
      },
    },
    {
      label: `Edit ${templateType}`,
      icon: 'pencil',
      onClick: function (row, index, tableApi) {
        tableApi.actions.subform({
          config: {
            submissionId: row.id,
            modalTitle: `Edit ${templateType}`,
            modalSize: 'lg',
            saveLabel: 'Update',
            onSave: function (data, api) {
              api.submit(function (result) {
                // Update the row in the table so it appears immediately before the table reloads
                const updatedRow = mapSubmissionToRow(
                  templateType,
                  result.submission,
                );
                tableApi.updateRow(updatedRow, index);
                // Reload the table data in the background
                tableApi.reloadData();
                toastSuccess({ title: `${templateType} updated successfully` });
                api.destroy();
              });
            },
          },
        });
      },
    },
    {
      label: `Delete ${templateType}`,
      icon: 'trash',
      onClick: function (row, index, tableApi) {
        openConfirm({
          title: `Delete ${templateType}`,
          acceptLabel: 'Yes',
          description: `Are you sure you want to delete the ${templateType.toLowerCase()}: ${row.name}?`,
          successMessage: `${templateType} was successfully deleted`,
          accept: function () {
            deleteSubmission({ id: row.id }).then(({ error }) => {
              if (error) {
                toastError({
                  title: `There was an error deleting the ${templateType.toLowerCase()}: ${row.name}`,
                });
              } else {
                // Delete the row in the table so it is removed immediately before the table reloads
                tableApi.deleteRow(index);
                // Reload the table data in the background
                tableApi.reloadData();
              }
            });
          },
        });
      },
    },
  ];

  return (
    <div className="gutter">
      <div className="pt-1 pb-6">
        <PageHeading title="Notifications" backTo="/" />

        <div className="rounded-box md:border md:p-8">
          <div className="mb-6">
            <div className="flex-ss gap-2">
              {['Templates', 'Snippets', 'Date Formats'].map(tab => (
                <button
                  key={tab}
                  className={clsx(
                    'kbtn kbtn-ghost',
                    activeTab === tab && 'kbtn-active',
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'Templates' && (
            <TableComponent
              integration={templatesIntegration}
              rowTransform={rowTransform}
              columns={[
                {
                  label: 'Submission Id',
                  property: 'id',
                  visible: false,
                  toggleable: false,
                },
                { label: 'Status', property: 'status' },
                { label: 'Name', property: 'name' },
              ]}
              addAction={createAddAction('Template', 'notification-data')}
              rowActions={createRowActions('Templates')}
              title="Templates"
              messages={{
                loading: 'Loading templates',
                empty: 'There are no templates',
                noMatches: 'No templates match your filter query',
              }}
            />
          )}

          {activeTab === 'Snippets' && (
            <TableComponent
              integration={snippetsIntegration}
              rowTransform={rowTransform}
              columns={[
                {
                  label: 'Submission Id',
                  property: 'id',
                  visible: false,
                  toggleable: false,
                },
                { label: 'Status', property: 'status' },
                { label: 'Name', property: 'name' },
              ]}
              addAction={createAddAction('Snippet', 'notification-data')}
              rowActions={createRowActions('Snippets')}
              title="Snippets"
              messages={{
                loading: 'Loading snippets',
                empty: 'There are no snippets',
                noMatches: 'No snippets match your filter query',
              }}
            />
          )}

          {activeTab === 'Date Formats' && (
            <TableComponent
              integration={dateFormatsIntegration}
              rowTransform={rowTransform}
              columns={[
                {
                  label: 'Submission Id',
                  property: 'id',
                  visible: false,
                  toggleable: false,
                },
                { label: 'Status', property: 'status' },
                { label: 'Name', property: 'name' },
                { label: 'Format', property: 'format' },
              ]}
              addAction={createAddAction(
                'Date Format',
                'notification-template-dates',
              )}
              rowActions={createRowActions('Date Format')}
              title="Date Formats"
              messages={{
                loading: 'Loading date formats',
                empty: 'There are no date formats',
                noMatches: 'No date formats match your filter query',
              }}
            />
          )}
        </div>
      </div>

      <Modal
        open={previewModal.open}
        onOpenChange={({ open }) => !open && closePreviewModal()}
        title={previewModal.title}
        size="lg"
      >
        <div slot="body" className="overflow-auto max-h-[70vh]">
          {previewModal.loading ? (
            <p className="text-base-content/60 italic">Loading preview...</p>
          ) : previewModal.htmlContent ? (
            <div
              dangerouslySetInnerHTML={{ __html: previewModal.htmlContent }}
            />
          ) : (
            <p className="text-base-content/60 italic">
              No HTML content available
            </p>
          )}
        </div>
        <div slot="footer" className="flex-ee gap-2">
          <button
            className="kbtn kbtn-lg kbtn-primary"
            onClick={closePreviewModal}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};
