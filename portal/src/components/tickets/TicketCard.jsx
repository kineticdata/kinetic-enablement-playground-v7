import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { getAttributeValue } from '../../helpers/records.js';
import { Icon } from '../../atoms/Icon.jsx';
import { StatusPill } from './StatusPill.jsx';
import { callIfFn, timeAgo } from '../../helpers/index.js';
import { useSelector } from 'react-redux';
import { openConfirm } from '../../helpers/confirm.js';
import { deleteSubmission } from '@kineticdata/react';
import { toastError, toastSuccess } from '../../helpers/toasts.js';
import useSwipe from '../../helpers/hooks/useSwipe.js';

const getMetaData = submission => {
  if (['Approval', 'Task'].includes(submission.type)) {
    switch (submission.coreState) {
      case 'Submitted':
      case 'Closed':
        return {
          status: 'Closed',
          dateString: `Closed ${timeAgo(submission.submittedAt)}`,
        };
      default:
        return {
          status: 'Open',
          dateString: `Opened ${timeAgo(submission.createdAt)}`,
        };
    }
  } else if (['Service'].includes(submission.type)) {
    switch (submission.coreState) {
      case 'Draft':
        return {
          status: 'Draft',
          dateString: `Created ${timeAgo(submission.createdAt)}`,
          canDelete: true,
        };
      case 'Closed':
        return {
          status: 'Closed',
          dateString: `Closed ${timeAgo(submission.closedAt)}`,
        };
      default:
        return {
          status: 'Open',
          dateString: `Submitted ${timeAgo(submission.submittedAt)}`,
        };
    }
  }
};

/**
 * Build the link path for the submission. If it is a draft request, render the
 * submission form. Otherwise, render the details route.
 */
const getToPath = submission =>
  ['Service'].includes(submission.type) && submission.coreState === 'Draft'
    ? `${submission.id}/edit`
    : submission.id;

/**
 * Handler for deleting a draft request.
 */
const handleDelete = (id, reload) =>
  openConfirm({
    title: 'Delete Draft',
    description: 'Are you sure you want to delete this draft request?',
    acceptLabel: 'Delete',
    accept: () =>
      deleteSubmission({ id }).then(({ error }) => {
        if (error) {
          toastError({
            title: 'Failed to delete draft request',
            description: error.message,
          });
        } else {
          toastSuccess({ title: 'Successfully deleted draft request' });
          callIfFn(reload);
        }
      }),
  });

export const TicketCard = ({ submission, reload }) => {
  const mobile = useSelector(state => state.view.mobile);
  const location = useLocation();
  const icon = getAttributeValue(submission?.form, 'Icon', 'checklist');
  const meta = getMetaData(submission);
  const { onTouchStart, onTouchMove, onTouchEnd, left, right } = useSwipe({
    threshold: 80,
    onLeftSwipe: () => handleDelete(submission.id, reload),
  });

  return (
    <div
      className={clsx(
        // Non mobile styles
        'md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid]',
        // Common styles
        'group relative',
      )}
      onTouchStart={mobile && meta.canDelete ? onTouchStart : undefined}
      onTouchMove={mobile && meta.canDelete ? onTouchMove : undefined}
      onTouchEnd={mobile && meta.canDelete ? onTouchEnd : undefined}
    >
      {mobile && meta.canDelete && (
        <div
          className={clsx(
            'absolute top-0 right-0.25 h-full w-24 pl-4',
            'flex-c-cc gap-1 bg-error text-error-content rounded-r-box',
          )}
        >
          <Icon name="trash" />
          <span className="text-xs font-medium">Delete</span>
        </div>
      )}
      <div
        className={clsx(
          // Mobile first styles
          'flex py-1.25 px-3',
          // Non mobile styles
          'md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid] md:py-2.75 md:px-6',
          // Common styles
          'group relative gap-3 items-center min-h-16 rounded-box bg-base-100 border transition',
          'hover:bg-base-200 focus-within:bg-base-200',
        )}
        style={{ left, right }}
      >
        <div className="icon-box flex-none">
          <Icon name={icon} />
        </div>
        {mobile ? (
          <div className="flex flex-col gap-1 min-w-0">
            <Link
              className="text-sm font-medium leading-4 line-clamp-2 after:absolute after:inset-0 outline-0"
              to={getToPath(submission)}
              state={{ backPath: location.pathname }}
            >
              {submission.label}
            </Link>
            <div className="text-xs text-base-content/60">
              {meta.dateString}
            </div>
          </div>
        ) : (
          <>
            <Link
              className="font-medium leading-5 line-clamp-2 after:absolute after:inset-0 outline-0"
              to={getToPath(submission)}
              state={{ backPath: location.pathname }}
            >
              {submission.label}
            </Link>
            <div className="text-base-content/60">{meta.dateString}</div>
          </>
        )}
        <div className="max-md:ml-auto flex gap-2 items-center">
          <StatusPill
            className={clsx('md:min-w-32 justify-end', {
              'group-hover:min-w-20 group-focus-within:min-w-20':
                !mobile && meta.canDelete,
            })}
            status={meta.status}
          />
          {!mobile && meta.canDelete && (
            <button
              type="button"
              className={clsx(
                'kbtn kbtn-soft kbtn-circle',
                'relative -my-1 not-group-hover:not-group-focus-within:hidden',
              )}
              onClick={() => handleDelete(submission.id, reload)}
              aria-label="Delete Draft"
            >
              <Icon name="trash" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const EmptyCard = ({ children }) => (
  <div
    className={clsx(
      'relative p-1 md:py-3 md:px-6 bg-base-100 rounded-box min-h-16 max-md:flex md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid] gap-3 items-center italic text-base-content/60',
    )}
  >
    {children}
  </div>
);
