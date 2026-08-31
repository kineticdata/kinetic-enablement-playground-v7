import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { RequestsList } from './RequestsList.jsx';
import { RequestDetail } from './RequestDetail.jsx';
import { Form } from '../../forms/Form.jsx';
import { usePaginatedData } from '../../../helpers/hooks/usePaginatedData.js';

const buildMyRequestsSearch = (profile, filters) => {
  // Start query builder
  const search = defineKqlQuery();

  // Limit form types
  search.in('type', 'types');
  // Add core state query if filtering by a status
  if (filters.status.open || filters.status.closed || filters.status.draft) {
    search.in('coreState', 'statuses');
  }
  // Add assignment query
  search.or();
  search.equals('createdBy', 'username');
  search.equals('submittedBy', 'username');
  search.equals('values[Requested For]', 'username');
  // End or block
  search.end();
  // End query builder
  search.end();

  return {
    q: search.end()({
      types: ['Service'],
      statuses: [
        filters.status.draft && 'Draft',
        filters.status.open && 'Submitted',
        filters.status.closed && 'Closed',
      ].filter(Boolean),
      username: profile.username,
    }),
    include: ['details', 'values', 'form', 'form.attributesMap'],
    limit: 10,
  };
};

export const Requests = () => {
  const { profile, kappSlug } = useSelector(state => state.app);

  // State for filters
  const [filters, setFilters] = useState({
    status: { draft: false, open: false, closed: false },
  });

  // Parameters for the query (if null, the query will not run)
  const params = useMemo(
    () => ({ kapp: kappSlug, search: buildMyRequestsSearch(profile, filters) }),
    [kappSlug, profile, filters],
  );

  // Retrieve the data for the requests list
  const { initialized, loading, response, pageNumber, actions } =
    usePaginatedData(searchSubmissions, params);

  return (
    <Routes>
      <Route path=":submissionId" element={<RequestDetail />} />
      <Route
        path=":submissionId/edit"
        element={<Form listActions={actions} />}
      />
      <Route path=":submissionId/review" element={<Form review={true} />} />
      <Route
        path="*"
        element={
          <RequestsList
            listData={{
              initialized,
              loading,
              data: response?.submissions,
              error: response?.error,
              pageNumber,
            }}
            listActions={actions}
            filters={filters}
            setFilters={setFilters}
          />
        }
      />
    </Routes>
  );
};
