import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { useMemo } from 'react';
import { Icon } from '../../atoms/Icon.jsx';
import { Error } from '../../components/states/Error.jsx';
import { Loading } from '../../components/states/Loading.jsx';
import { sortBy } from '../../helpers/index.js';
import { useData } from '../../helpers/hooks/useData.js';
import { getAttributeValue } from '../../helpers/records.js';
import { openSearch } from '../../helpers/search.js';
import { StatusPill } from '../../components/tickets/StatusPill.jsx';

export const Home = () => {
  const { mobile, desktop } = useSelector(state => state.view);
  const { profile } = useSelector(state => state.app);

  return (
    <>
      <div className="flex-bt gap-20 2xl:gap-42 gutter xl:pr-14 max-md:py-9 md:h-64 bg-base-200">
        <div className="flex-auto flex-c-ct gap-10">
          {!mobile && (
            <div className="text-4xl xl:text-6xl font-semibold">
              Hello, {profile.displayName}
            </div>
          )}
          <div
            className={clsx(
              'flex-bc gap-6 xl:gap-8',
              mobile && 'justify-around',
            )}
          >
            {!mobile ? (
              <>
                <button
                  type="button"
                  className="kbtn kbtn-primary kbtn-xl flex-1"
                  onClick={() => openSearch()}
                >
                  Submit a Request
                </button>
                <Link
                  to="/requests"
                  className="kbtn kbtn-outline kbtn-base kbtn-xl flex-1"
                >
                  Check Status
                </Link>
                <Link
                  to="/actions"
                  className="kbtn kbtn-outline kbtn-base kbtn-xl flex-1"
                >
                  See My Work
                </Link>
              </>
            ) : (
              <>
                <div className="relative flex-1 flex-c-sc gap-4">
                  <div className="icon-box-lg bg-primary text-primary-content">
                    <Icon name="send" />
                  </div>
                  <button
                    type="button"
                    onClick={() => openSearch()}
                    className="cursor-pointer after:absolute after:inset-0 text-center"
                  >
                    Submit a Request
                  </button>
                </div>
                <div className="relative flex-1 flex-c-sc gap-4">
                  <div className="icon-box-lg bg-base-100 text-base-content border">
                    <Icon name="list-search" />
                  </div>
                  <Link
                    to="/requests"
                    className="cursor-pointer after:absolute after:inset-0 text-center"
                  >
                    Check Status
                  </Link>
                </div>
                <div className="relative flex-1 flex-c-sc gap-4">
                  <div className="icon-box-lg bg-base-100 text-base-content border">
                    <Icon name="list-details" />
                  </div>
                  <Link
                    to="/actions"
                    className="cursor-pointer after:absolute after:inset-0 text-center"
                  >
                    See My Work
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
        {desktop && <Shortcuts vertical={true} />}
      </div>

      <div className="flex-c-st xl:flex-bs gap-7 md:gap-10 xl:gap-20 gutter py-7">
        <div className="flex-1 flex-c-st gap-4">
          <div className="text-lg md:text-2xl font-semibold">
            Recent Activity
          </div>
          <div className="kcard">
            <div className="kcard-body">
              <ActivityList />
            </div>
          </div>
        </div>
        <div className="flex-1 flex-c-st gap-4">
          <div className="text-lg md:text-2xl font-semibold">Recent Work</div>
          <div className="kcard">
            <div className="kcard-body">
              <WorkList />
            </div>
          </div>
        </div>
      </div>

      {!desktop && <Shortcuts className="gutter pt-3 pb-10" />}
    </>
  );
};

const ActivityList = () => {
  const { profile, kappSlug } = useSelector(state => state.app);
  const { username } = profile;

  // Parameters for the query
  const params = useMemo(
    () => ({
      kapp: kappSlug,
      search: {
        q: defineKqlQuery()
          // Limit form types
          .in('type', 'types')
          // Add assignment query so we only retrieve requests for the current user
          .or()
          .equals('createdBy', 'username')
          .equals('submittedBy', 'username')
          .equals('values[Requested For]', 'username')
          // End or block
          .end()
          // End query builder
          .end()({ types: ['Service'], username }),
        include: ['details', 'form', 'form.attributesMap'],
        limit: 5,
      },
    }),
    [kappSlug, username],
  );

  // Retrieve the submission record
  const data = useData(searchSubmissions, params);
  const { error, submissions } = data.response || {};

  if (data.initialized) {
    return error ? (
      <Error error={error} />
    ) : data.loading ? (
      <Loading />
    ) : (
      <ul className="klist text-base">
        {submissions?.map(submission => (
          <li
            className="klist-row min-h-20 hover:bg-base-200"
            key={submission.id}
          >
            <div className="icon-box -my-3">
              <Icon
                name={getAttributeValue(submission?.form, 'Icon', 'checklist')}
              />
            </div>
            <Link
              to={`/requests/${submission.id}${submission.coreState === 'Draft' ? '/edit' : ''}`}
              className="line-clamp-2 after:absolute after:inset-0"
            >
              {submission.label}
            </Link>
            <StatusPill status={submission.coreState}></StatusPill>
          </li>
        ))}
        {submissions?.length === 0 && <li>There is no activity to show.</li>}
      </ul>
    );
  }
};

const WorkList = () => {
  const { profile, kappSlug } = useSelector(state => state.app);
  const { username, memberships } = profile;

  // Parameters for the query
  const params = useMemo(
    () => ({
      kapp: kappSlug,
      search: {
        q: defineKqlQuery()
          // Limit form types
          .in('type', 'types')
          // Add assignment query so we only retrieve requests for the current user
          .or()
          .equals('values[Assigned Individual]', 'username')
          .in('values[Assigned Team]', 'teams')
          // End or block
          .end()
          // End query builder
          .end()({
          types: ['Approval', 'Task'],
          username,
          teams: memberships.map(({ team }) => team.name),
        }),
        include: ['details', 'form', 'form.attributesMap'],
        limit: 5,
      },
    }),
    [kappSlug, username, memberships],
  );

  // Retrieve the submission record
  const data = useData(searchSubmissions, params);
  const { error, submissions } = data.response || {};

  if (data.initialized) {
    return error ? (
      <Error error={error} />
    ) : data.loading ? (
      <Loading />
    ) : (
      <ul className="klist text-base">
        {submissions?.map(submission => (
          <li
            className="klist-row min-h-20 hover:bg-base-200"
            key={submission.id}
          >
            <div className="icon-box -my-3">
              <Icon
                name={getAttributeValue(submission?.form, 'Icon', 'checklist')}
              />
            </div>
            <Link
              to={`/actions/${submission.id}`}
              className="line-clamp-2 after:absolute after:inset-0"
            >
              {submission.label}
            </Link>
            <StatusPill
              status={submission.coreState === 'Draft' ? 'Open' : 'Closed'}
            ></StatusPill>
          </li>
        ))}
        {submissions?.length === 0 && <li>There is no work to show.</li>}
      </ul>
    );
  }
};

// Transform function for converting shortcuts submissions into the format
// needed for the UI
const shortcutsTransform = submissions =>
  submissions
    ?.map(({ values }) => ({
      title: values['Title'],
      link: values['URL'],
      image: values['Image'],
      newTab: values['New Tab']?.includes('Yes'),
      sortOrder: parseInt(values['Sort Order'], 10) || 999,
    }))
    ?.sort(sortBy('sortOrder'));

const Shortcuts = ({ vertical = false, className }) => {
  const { kappSlug } = useSelector(state => state.app);

  // Parameters for the shortcuts query
  const params = useMemo(
    () => ({
      kapp: kappSlug,
      form: 'portal-shortcuts',
      search: {
        q: defineKqlQuery().equals('values[Status]', 'status').end()({
          status: 'Active',
        }),
        include: ['values'],
        limit: 10,
      },
    }),
    [kappSlug],
  );

  const { initialized, loading, response } = useData(searchSubmissions, params);
  const shortcuts = shortcutsTransform(response?.submissions);

  return (
    <div
      className={clsx(
        'flex-none gap-3 overflow-auto',
        vertical && 'w-89 grid grid-cols-2',
        !vertical && 'w-full flex-sc',
        className,
      )}
      style={{ scrollbarWidth: 'none' }}
    >
      {initialized &&
        !loading &&
        !response?.error &&
        shortcuts?.map((shortcut, index) => (
          <a
            key={index}
            href={shortcut.link}
            target={shortcut.newTab ? '_blank' : undefined}
            rel="noreferrer"
            className={clsx(
              'relative bg-base-300 rounded-box overflow-hidden',
              vertical && [
                'flex-full h-33 row-span-2',
                index === 1 && 'row-start-2',
                'hover:scale-105 transition-transform',
                shortcuts.length !== 1 && {
                  'hover:translate-x-1/40': index % 2 === 1,
                  'hover:-translate-x-1/40': index % 2 === 0,
                },
                shortcuts.length === 1 && 'hover:translate-1/40',
              ],
              !vertical && ['flex-none h-50 w-65'],
            )}
          >
            {shortcut.image && (
              <img
                src={shortcut.image}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
            <small className="absolute inset-x-0 bottom-0 px-2 pt-2 pb-4 bg-black/60 text-white">
              <span className="font-medium line-clamp-2 text-center">
                {shortcut.title}
              </span>
            </small>
          </a>
        ))}
    </div>
  );
};
