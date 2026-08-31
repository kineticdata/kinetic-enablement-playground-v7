import { bundle, getCsrfToken } from '@kineticdata/react';

const handleResponse = async response => {
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

const handleError = error => {
  if (typeof error === 'object') {
    const { error: m1, errorKey: key = null, message: m2, ...rest } = error;
    const message = m1 || m2 || 'Unexpected error occurred.';
    return { error: { ...rest, message, key } };
  }
  return { error: { message: 'Unexpected error occurred.' } };
};

export const executeIntegration = ({
  kappSlug,
  formSlug,
  integrationName,
  parameters,
}) =>
  fetch(
    [
      `${bundle.apiLocation()}/integrations/kapps/${kappSlug}`,
      formSlug && `/forms/${formSlug}`,
      `/${integrationName}`,
    ]
      .filter(Boolean)
      .join(''),
    {
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: { 'X-XSRF-TOKEN': getCsrfToken() },
    },
  )
    .then(handleResponse)
    .catch(handleError);
