import Image from 'next/image';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo-brain.svg" alt="GenAI Labs" width={32} height={32} />
          <span>© {new Date().getFullYear()} GenAI.Labs experimental toolkit</span>
        </div>
        <p className="max-w-xl text-slate-500">
          Designed for the LLM Lab challenge — includes export-ready experiment data,
          transparent heuristics, and an audit-friendly activity log.
        </p>
      </div>
    </footer>
  );
}
