import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Back chevron · centred title · optional right slot (like the reference's detail screen). */
export default function PageHeader({
  back,
  onBack,
  title,
  subtitle,
  right,
}: {
  back?: string;
  onBack?: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const btn = "flex size-10 items-center justify-center rounded-full -ml-2";
  return (
    <header className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-5 pt-4 pb-3">
      {onBack ? (
        <button onClick={onBack} aria-label="Back" className={btn}>
          <ChevronLeft size={24} strokeWidth={1.75} />
        </button>
      ) : back ? (
        <Link href={back} aria-label="Back" className={btn}>
          <ChevronLeft size={24} strokeWidth={1.75} />
        </Link>
      ) : (
        <span />
      )}
      <div className="min-w-0 text-center">
        <p className="ko truncate text-lg leading-tight font-semibold tracking-tight">{title}</p>
        {subtitle && <p className="label truncate">{subtitle}</p>}
      </div>
      <div className="flex min-w-10 justify-end gap-2">{right}</div>
    </header>
  );
}
