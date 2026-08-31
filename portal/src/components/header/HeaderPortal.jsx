import { useRef } from 'react';
import { Portal } from '@ark-ui/react/portal';

export const HeaderPortal = ({ children }) => {
  const ref = useRef(document.getElementById('app-header'));

  return <Portal container={ref}>{children}</Portal>;
};
