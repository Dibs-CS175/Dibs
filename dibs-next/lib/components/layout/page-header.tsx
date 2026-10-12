export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold md:text-5xl">{title}</h1>
        {subtitle ? <p className="max-w-prose text-base text-muted">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}
