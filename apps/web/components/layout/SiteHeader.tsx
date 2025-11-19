import Image from 'next/image';

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Image src="/logo-brain.svg" alt="GenAI Labs brain" width={48} height={48} />
          <div>
            <Image src="/logo-text.svg" alt="GenAI Labs" width={160} height={32} />
            <p className="text-sm text-slate-500">
              Parameter playground for thoughtful LLM experimentation
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <span>LLM Lab Console</span>
          <span className="rounded-full bg-[#EFF2FF] px-4 py-1 text-[#3C5CCC] font-semibold">
            v1.0
          </span>
        </div>
      </div>
    </header>
  );
}
