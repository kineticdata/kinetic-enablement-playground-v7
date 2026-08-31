import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { fetchSubmission } from '@kineticdata/react';
import { generateFormLayout } from '../../../components/forms/FormLayout.jsx';
import { KineticForm } from '../../../components/kinetic-form/KineticForm.jsx';
import { Loading } from '../../../components/states/Loading.jsx';
import { Error } from '../../../components/states/Error.jsx';
import { Panel } from '../../../atoms/Panel.jsx';
import { useData } from '../../../helpers/hooks/useData.js';
import { Icon } from '../../../atoms/Icon.jsx';

const ViewParentButton = ({ submission }) => {
  const [open, setOpen] = useState(false);

  if (!submission?.parent) return null;

  return (
    <>
      <Panel open={open} onOpenChange={({ open }) => setOpen(open)}>
        <button type="button" slot="trigger" className="kbtn kbtn-lg">
          View Original Request
        </button>
        <div slot="content" className="flex-c-st gap-6">
          <div className="flex-bc gap-3">
            <span className="h3">Original Request</span>
            <button
              className="kbtn kbtn-sm kbtn-circle kbtn-ghost absolute right-2 top-2"
              onClick={() => setOpen(false)}
            >
              <Icon name="x" size={20} />
            </button>
          </div>
          <KineticForm submissionId={submission.parent.id} review={true} />
        </div>
      </Panel>
    </>
  );
};

export const ActionForm = ({ listActions: { reloadPage } }) => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.backPath || '/actions';

  // Parameters for the query
  const params = useMemo(() => ({ id: submissionId }), [submissionId]);

  // Retrieve the submission record
  const { response } = useData(fetchSubmission, params);
  const { error, submission: data } = response || {};

  // Generate the layout for the form
  const Layout = useMemo(
    () =>
      generateFormLayout({
        headingComponent: ViewParentButton,
        backTo,
      }),
    [backTo],
  );

  const handleCompleted = useCallback(() => {
    navigate(backTo);
    reloadPage();
  }, [navigate, backTo, reloadPage]);

  return data ? (
    <KineticForm
      submissionId={submissionId}
      components={{ Layout }}
      completed={handleCompleted}
      // Load the submission in review mode if it's not in Draft state
      review={data.coreState !== 'Draft'}
    />
  ) : (
    <Layout
      content={!error ? <Loading /> : <Error error={error}></Error>}
    ></Layout>
  );
};
