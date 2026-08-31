import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { fetchSubmission } from '@kineticdata/react';
import { Icon } from '../../../atoms/Icon.jsx';
import { Modal } from '../../../atoms/Modal.jsx';
import {
  StatusDot,
  StatusPill,
} from '../../../components/tickets/StatusPill.jsx';
import { Error } from '../../../components/states/Error.jsx';
import { Loading } from '../../../components/states/Loading.jsx';
import { executeIntegration } from '../../../helpers/api.js';
import { callIfFn, timeAgo } from '../../../helpers/index.js';
import { getAttributeValue } from '../../../helpers/records.js';
import { toastError, toastSuccess } from '../../../helpers/toasts.js';
import { useData } from '../../../helpers/hooks/useData.js';
import { usePoller } from '../../../helpers/hooks/usePoller.js';
import { PageHeading } from '../../../components/PageHeading.jsx';

const parseActivityData = data => {
  if (!data) return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const createWorkNote = ({ kappSlug, id, note, onSuccess }) => {
  executeIntegration({
    kappSlug,
    integrationName: 'Create SNOW Incident Work Note',
    parameters: { id: id, note },
  }).then(response => {
    if (response.error) {
      toastError({ title: 'Failed to save the work note.' });
    } else {
      toastSuccess({ title: 'Work note added successfully.' });
      callIfFn(onSuccess);
    }
  });
};

const WorkNotes = ({ id }) => {
  const { kappSlug } = useSelector(state => state.app);
  const mobile = useSelector(state => state.view.mobile);
  // State for tracking if work notes section is open
  const [open, setOpen] = useState(false);

  // Parameters for the query (if null, the query will not run)
  const params = useMemo(
    () =>
      open
        ? {
            kappSlug,
            integrationName: 'Get SNOW Incident Work Notes',
            parameters: { id },
          }
        : null,
    [kappSlug, open, id],
  );

  // Retrieve the work notes
  const { initialized, loading, response, actions } = useData(
    executeIntegration,
    params,
  );
  const { Result: data } = response || {};
  const { reloadData } = actions;

  // State for adding new work notes
  const [newNote, setNewNote] = useState(null);

  if (id) {
    return (
      <div className="flex-c-st gap-3">
        <div className="flex-bc">
          <button
            type="button"
            className="kbtn kbtn-sm"
            onClick={() => setOpen(o => !o)}
          >
            <span>Work Notes</span>
            <Icon
              name={open ? 'chevron-up' : 'chevron-down'}
              size={mobile ? 20 : 24}
            />
          </button>
          {open && (
            <button
              type="button"
              className="kbtn kbtn-sm kbtn-ghost kbtn-circle"
              onClick={reloadData}
              disabled={loading}
              aria-label="Refresh Work Notes"
            >
              <Icon name="refresh" size={mobile ? 16 : 20} />
            </button>
          )}
        </div>

        {open && initialized && (
          <>
            {loading && <Loading size={28} xsmall />}
            {!loading && (!data || data.length === 0) && (
              <div className="bg-base-200 rounded-box px-2 py-1.5 md:py-3 text-base-content/60 italic">
                There are no work notes.
              </div>
            )}
            {(data || []).map((note, i) => (
              <div
                key={`${note?.['Created On']}-${i}`}
                className="bg-base-200 rounded-box px-2 py-1.5 md:py-3"
              >
                <div className="text-xs md:text-sm text-base-content/60 mb-2">
                  {timeAgo(note?.['Created On'])}
                </div>
                <div className="max-md:text-sm">{note?.['Value']}</div>
              </div>
            ))}
            <div className="flex-cc">
              <Modal
                title="Add Work Note"
                open={newNote !== null}
                onOpenChange={({ open }) => setNewNote(open ? '' : null)}
                size="sm"
              >
                <button slot="trigger" type="button" className="kbtn kbtn-sm">
                  Add Work Note
                </button>
                <div slot="body" className="field">
                  <textarea
                    name="new-work-note"
                    rows="4"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="New note"
                  />
                </div>
                <div slot="footer">
                  <button
                    type="button"
                    className="kbtn kbtn-lg kbtn-primary w-full"
                    disabled={!newNote}
                    onClick={() =>
                      createWorkNote({
                        kappSlug,
                        id,
                        note: newNote,
                        onSuccess: () => {
                          setNewNote(null);
                          reloadData();
                        },
                      })
                    }
                  >
                    Save
                  </button>
                </div>
              </Modal>
            </div>
          </>
        )}
      </div>
    );
  }
};

const Activity = ({ first, last, mobile, icon, activity }) => {
  const data = parseActivityData(activity.data);
  const snowIncidentSysId = data?.['SNOW SYS ID'];
  const status =
    !data?.Status || ['Approved', 'Complete'].includes(data?.Status)
      ? true
      : ['Denied', 'Cancelled'].includes(data?.Status)
        ? false
        : null;

  return (
    <div
      className={clsx(
        // Common styles
        'relative flex-c-st bg-base-100 border rounded-box',
        // Mobile first styles
        'p-3 ml-8 gap-3',
        // Non mobile styles
        'md:p-7 md:ml-20 md:gap-5',
      )}
    >
      <div
        className={clsx(
          'absolute w-1 bg-success',
          '-left-6',
          'md:-left-[3.875rem]',
          {
            'top-0': !first,
            'top-1/2': first,
            'h-0': first && last,
            'h-[calc(50%+1.875rem)]': first && !last,
            'h-[calc(100%+1.875rem)]': !first && !last,
            'h-1/2': !first && last,
          },
        )}
      />
      <div
        className={clsx(
          'absolute flex justify-center items-center',
          'border border-base-300 top-1/2 -translate-y-1/2 -left-8 w-5 h-5 rounded-[5px]',
          'md:-left-20 md:w-10 md:h-10 md:rounded-[10px]',
          {
            'bg-base-100 text-base-content': status === null,
            'bg-success text-success-content': status === true,
            'bg-warning text-warning-content': status === false,
          },
        )}
      >
        {icon && <Icon name={icon} size={mobile ? 12 : 24} />}
        {status === true && (
          <Icon
            name="circle-check"
            className="absolute -right-1 -bottom-1"
            size={mobile ? 12 : 16}
            filled
          />
        )}
        {status === false && (
          <Icon
            name="circle-x"
            className="absolute -right-1 -bottom-1"
            size={mobile ? 12 : 16}
            filled
          />
        )}
      </div>
      <div className="flex-sc gap-3">
        <div className="flex-auto flex-c-st gap-1 md:gap-2.5">
          {activity.createdAt && (
            <div className="text-xs md:text-sm text-base-content/60">
              {timeAgo(activity.createdAt)}
            </div>
          )}
          <div className="max-md:text-sm font-medium">{activity.label}</div>
        </div>
        {data?.Status && (
          <div className="flex-none flex-sc gap-2 font-light max-md:text-xs">
            {data.Status}
            <StatusDot
              status={
                status === true
                  ? 'Success'
                  : status === false
                    ? 'Failure'
                    : 'None'
              }
            />
          </div>
        )}
      </div>
      {data && (
        <div className="bg-base-200 rounded-box px-2 py-1.5 md:py-3">
          {typeof data === 'string' ? (
            <span className="max-md:text-xs">{data}</span>
          ) : (
            <dl
              className="max-md:text-xs flex flex-wrap gap-3 md:gap-x-12"
              style={{ overflowWrap: 'anywhere' }}
            >
              {Object.entries(data).map(
                ([key, value]) =>
                  key !== 'Status' && (
                    <div key={key} className="flex flex-col gap-0.5 md:gap-1">
                      <dt className="text-base-content/60 font-medium">
                        {key}
                      </dt>
                      <dd>{value}</dd>
                    </div>
                  ),
              )}
            </dl>
          )}
        </div>
      )}
      {snowIncidentSysId && <WorkNotes id={snowIncidentSysId} />}
    </div>
  );
};

export const RequestDetail = () => {
  const { submissionId } = useParams();
  const mobile = useSelector(state => state.view.mobile);

  // Parameters for the query (if null, the query will not run)
  const params = useMemo(
    () => ({
      id: submissionId,
      include: 'activities,activities.details,details,form.attributesMap[Icon]',
    }),
    [submissionId],
  );

  // Retrieve the submission record
  const { initialized, loading, response, actions } = useData(
    fetchSubmission,
    params,
  );
  const { error, submission: data } = response || {};
  const { reloadData } = actions;

  const icon = getAttributeValue(
    data?.form,
    'Icon',
    data ? 'checklist' : 'blank',
  );

  // Start a poller to reload the submission regularly
  usePoller(reloadData);

  return (
    <div className="gutter">
      <div className="max-w-screen-lg pt-1 pb-6">
        <PageHeading
          title={data?.label}
          after={data && <StatusPill status={data.coreState} />}
        >
          <Link to="review" className="kbtn kbtn-lg ml-auto">
            View Request
          </Link>
        </PageHeading>

        <div className="w-full lg:pl-24">
          {initialized &&
            (error ? (
              <Error error={error} />
            ) : loading && !data ? (
              <Loading />
            ) : (
              <div className={clsx('flex-c-st gap-5 md:gap-7 py-3')}>
                {data?.submittedAt && (
                  <Activity
                    first={true}
                    last={!data?.closedAt && data?.activities?.length === 0}
                    icon={icon}
                    mobile={mobile}
                    activity={{
                      createdAt: data.submittedAt,
                      label: 'Request Submitted',
                      data: {
                        By: data.submittedBy,
                        Handle: data.handle,
                      },
                    }}
                  />
                )}
                {(data?.activities || []).map((activity, index) => (
                  <Activity
                    first={!data?.submittedAt && index === 0}
                    last={
                      !data?.closedAt && index === data?.activities?.length - 1
                    }
                    key={index}
                    icon={icon}
                    mobile={mobile}
                    activity={activity}
                  />
                ))}
                {data?.closedAt && (
                  <Activity
                    last={true}
                    icon={icon}
                    mobile={mobile}
                    activity={{
                      createdAt: data.closedAt,
                      label: 'Request Closed',
                    }}
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
