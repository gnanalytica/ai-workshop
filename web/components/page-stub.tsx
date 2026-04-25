import { Card, CardSub, CardTitle } from "@/components/ui/card";

/** Placeholder page content during the rebuild. Replaced surface-by-surface. */
export function PageStub({
  title,
  caps,
  description,
}: {
  title: string;
  caps?: string[];
  description?: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-muted mt-1 text-sm">{description}</p>}
      </div>
      <Card>
        <CardTitle>Under construction</CardTitle>
        <CardSub className="mt-2">
          This surface is being rebuilt against the new schema and shell.
        </CardSub>
        {caps && caps.length > 0 && (
          <p className="text-muted mt-4 font-mono text-xs">
            requires: {caps.join(" · ")}
          </p>
        )}
      </Card>
    </div>
  );
}
