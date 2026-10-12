export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border py-16 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export const LOAD_FAILED = {
  title: 'Could not load this page',
  body: 'The API did not respond. Check that the server is running on port 5000.',
};
