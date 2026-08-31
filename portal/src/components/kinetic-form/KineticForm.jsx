import { memo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CoreForm } from '@kineticdata/react';
import { Icon } from '../../atoms/Icon.jsx';
import { valuesFromQueryParams } from '../../helpers/index.js';
import { toastSuccess } from '../../helpers/toasts.js';
import { Loading as Pending } from '../states/Loading.jsx';

const ReviewPaginationControl = ({ index, actions }) => {
  return (
    <div className="flex-cc max-md:justify-between gap-3 md:gap-5 mt-5">
      <button
        type="button"
        className="kbtn kbtn-ghost kbtn-lg kbtn-circle"
        onClick={actions.previousPage}
        disabled={!actions.previousPage}
        aria-label="Previous Page"
      >
        <Icon name="chevrons-left" />
      </button>
      <div className="font-semibold">Page {index + 1}</div>
      <button
        type="button"
        className="kbtn kbtn-ghost kbtn-lg kbtn-circle"
        onClick={actions.nextPage}
        disabled={!actions.nextPage}
        aria-label="Next Page"
      >
        <Icon name="chevrons-right" />
      </button>
    </div>
  );
};

export const KineticForm = memo(
  ({ kappSlug, formSlug, submissionId, values, components = {}, ...props }) => {
    const [searchParams] = useSearchParams();
    const paramFieldValues = valuesFromQueryParams(searchParams);
    const navigate = useNavigate();

    const handleCreated = useCallback(
      response => {
        // Redirect to route with submission id if submission is not submitted or
        // there is a confirmation page to render.
        if (
          response.submission.coreState !== 'Submitted' ||
          response.submission?.displayedPage?.type === 'confirmation'
        ) {
          navigate(response.submission.id, { state: { persistToasts: true } });
        }

        if (response.submission.coreState === 'Draft') {
          toastSuccess({ title: 'Saved successfully.' });
        }
      },
      [navigate],
    );

    const handleUpdated = useCallback(response => {
      if (response.submission.coreState === 'Draft') {
        toastSuccess({ title: 'Saved successfully.' });
      }
    }, []);

    return (
      <CoreForm
        submission={submissionId}
        kapp={kappSlug}
        form={formSlug}
        values={values || paramFieldValues}
        components={{ Pending, ReviewPaginationControl, ...components }}
        created={handleCreated}
        updated={handleUpdated}
        {...props}
      />
    );
  },
);
