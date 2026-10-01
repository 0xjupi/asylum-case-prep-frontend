import { Link } from "react-router-dom";
import { Button } from "@/components/ui";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-3xl font-semibold text-ink">Page not found</p>
      <p className="mt-2 text-sm text-ink-soft">The page you're looking for doesn't exist in this workspace.</p>
      <Link to="/" className="mt-5">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
