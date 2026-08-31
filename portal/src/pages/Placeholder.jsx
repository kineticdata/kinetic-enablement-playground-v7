export const Placeholder = ({ title, children }) => {
  return (
    <div>
      <h1 className="mb-4">Placeholder</h1>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
};
