import { useRef } from 'react';
import { Portal } from '@ark-ui/react/portal';

export const FooterPortal = ({ children }) => {
  const ref = useRef(document.getElementById('app-footer'));

  return <Portal container={ref}>{children}</Portal>;
};
