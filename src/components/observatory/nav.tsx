import { Link } from "@tanstack/react-router";
import { ECOSYSTEM_APPS } from "@/data/seer";
import { cn } from "@/lib/utils";

export function ObservatoryNav() {
  return (
    <div className="sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-stretch justify-between gap-4 px-4 sm:px-8"
      >
        <Link to="/" className="flex items-baseline gap-3 py-3">
          <span className="display text-2xl leading-none text-ink">
            Seer<span className="text-violet">.</span>
          </span>
          <span className="eyebrow hidden text-ink-faint sm:inline">The Observatory</span>
        </Link>
        <div className="flex min-w-0 items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ECOSYSTEM_APPS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className={({ isActive }) =>
                cn(
                  "eyebrow flex items-center whitespace-nowrap border-b-2 px-3 py-3 transition-colors sm:px-4",
                  isActive
                    ? "border-violet-deep text-violet-deep"
                    : "border-transparent text-ink-soft hover:text-ink",
                )
              }
            >
              <span className="mr-1.5 text-ink-faint">{a.code}</span>
              {a.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
