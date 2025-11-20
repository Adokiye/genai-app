import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader() {
  return (
    <header className="border-b bg-[color-mix(in_oklab,var(--surface)_85%,_white_15%)] backdrop-blur-sm sticky top-0 z-20 theme-border theme-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 gap-6">
        <div className="flex items-center gap-4">
          <Image src="/logo-brain.svg" alt="GenAI Labs brain" width={48} height={48} />
          <div>
            <Image src="/logo-text.svg" alt="GenAI Labs" width={160} height={32} />
            <p className="text-sm text-muted">
              Parameter playground for thoughtful LLM experimentation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-secondary">
          <ThemeToggle />
          <span className="rounded-full bg-[var(--brand-soft)] px-4 py-1 text-[#3C5CCC] font-semibold">
            v1.0
          </span>
        </div>
      </div>
    </header>
  );
}
