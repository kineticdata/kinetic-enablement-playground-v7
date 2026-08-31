import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home } from './home/Home.jsx';
import { Actions } from './tickets/actions/Actions.jsx';
import { Requests } from './tickets/requests/Requests.jsx';
import { Form } from './forms/Form.jsx';
import { Profile } from './profile/Profile.jsx';
import { SettingsRouting } from './settings/index.jsx';
import { Header } from '../components/header/Header.jsx';
import { SearchModal } from '../components/search/SearchModal.jsx';
import { Theme } from './theme/index.jsx';

const Redirect = ({ to }) => {
  const params = useParams();
  return (
    <Navigate
      to={(typeof to === 'function' ? to(params) : to) || '/'}
      replace={true}
    />
  );
};

export const PrivateRoutes = () => {
  const spaceAdmin = useSelector(state => state.app.profile?.spaceAdmin);
  return (
    <Routes>
      {/* Theme page */}
      {spaceAdmin && <Route path="/theme" element={<Theme />} />}

      {/* Other Routes*/}
      <Route
        path="/*"
        element={
          <>
            {/* Shared header */}
            <Header />

            <Routes>
              {/* Canonical route for submissions */}
              <Route
                path="/kapps/:kappSlug/forms/:formSlug/submissions/:submissionId"
                element={
                  <Redirect
                    to={params =>
                      `/kapps/${params.kappSlug}/forms/${params.formSlug}/${params.submissionId}`
                    }
                  />
                }
              />
              {/* Canonical route for forms */}
              <Route
                path="/kapps/:kappSlug/forms/:formSlug/:submissionId?"
                element={<Form />}
              />
              {/* Canonical route for kapps */}
              <Route path="/kapps/:kappSlug" element={<Redirect to="/" />} />

              {/* Portal routes */}
              <Route path="/actions/*" element={<Actions />} />
              <Route path="/requests/*" element={<Requests />} />
              <Route
                path="/forms/:formSlug/:submissionId?"
                element={<Form />}
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings/*" element={<SettingsRouting />} />
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="/*" element={<Home />} />
            </Routes>

            {/* Global search modal */}
            <SearchModal />
          </>
        }
      />
    </Routes>
  );
};
