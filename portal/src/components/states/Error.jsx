import { ErrorHeader } from '../header/ErrorHeader.jsx';

export const Error = ({ error, header = false }) =>
  error && (
    <>
      {header && <ErrorHeader />}
      <div className="flex flex-col items-center gap-2 p-6">
        <h1 className="kbadge kbadge-error kbadge-xl">{`Error${error.statusCode ? ` - ${error.statusCode}` : ''}`}</h1>
        {error.message && (
          <p className="flex items-center gap-2 text-base-content/80">
            <span className="kstatus kstatus-error"></span>
            {error.message}
          </p>
        )}
      </div>
    </>
  );
