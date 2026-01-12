import { useEffect, useRef, useState } from 'react';
import { fetchPulseUpdates, PulseUpdate } from '../api/news';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const typeStyles: Record<string, string> = {
  GOVT: 'bg-blue-100 text-blue-800 border-blue-200',
  PRIVATE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  EXAM: 'bg-purple-100 text-purple-800 border-purple-200',
  DEADLINE: 'bg-amber-100 text-amber-800 border-amber-200',
  UPDATE: 'bg-slate-100 text-slate-800 border-slate-200',
};

const typeBorders: Record<string, string> = {
  GOVT: 'border-l-4 border-l-blue-400',
  PRIVATE: 'border-l-4 border-l-emerald-400',
  EXAM: 'border-l-4 border-l-purple-400',
  DEADLINE: 'border-l-4 border-l-amber-400',
  UPDATE: 'border-l-4 border-l-slate-300',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function MedicalPulse() {
  const [updates, setUpdates] = useState<PulseUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPulseUpdates();
        setUpdates(data);
      } catch {
        setUpdates([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || updates.length === 0) return;

    let raf: number;
    const tick = () => {
      if (!el || el.dataset.paused === 'true') {
        raf = requestAnimationFrame(tick);
        return;
      }
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
      el.scrollLeft = atEnd ? 0 : el.scrollLeft + 0.25;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [updates]);

  return (
    <section className="relative py-10 sm:py-12 px-4">
      <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 text-slate-900 shadow-[0_30px_70px_-40px_rgba(12,26,75,0.45)] border border-white/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(99,102,241,0.18),transparent_48%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.8),transparent_50%,rgba(255,255,255,0.7))]"></div>

          <div className="relative z-10 p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">🫀 Medical Pulse – Live Updates</h2>
                  <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-[ping_1.4s_ease-in-out_infinite] absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                    LIVE
                  </span>
                </div>
                <span className="text-sm text-slate-600">Real-time government, private & exam updates for doctors</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <a className="text-sm font-medium text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer">View all updates →</a>
                <div className="h-9 px-4 rounded-full bg-white/70 border border-white shadow-inner flex items-center justify-center text-xs">Auto-scroll</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 text-slate-800 bg-white hover:bg-slate-100"
                  onClick={() => containerRef.current?.scroll({ left: 0, behavior: 'smooth' })}
                >
                  Reset View
                </Button>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-4 left-0 w-20 bg-gradient-to-r from-blue-50 via-blue-50/70 to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-4 right-0 w-20 bg-gradient-to-l from-blue-50 via-blue-50/70 to-transparent"></div>

            <div
              ref={containerRef}
              className="relative mt-2 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
              onMouseEnter={() => {
                if (containerRef.current) containerRef.current.dataset.paused = 'true';
              }}
              onMouseLeave={() => {
                if (containerRef.current) containerRef.current.dataset.paused = 'false';
              }}
            >
              {loading && (
                <div className="flex gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="min-w-[240px] max-w-[280px] snap-start bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm animate-pulse">
                      <div className="h-4 w-20 bg-slate-200 rounded"></div>
                      <div className="mt-3 h-3 w-full bg-slate-200 rounded"></div>
                      <div className="mt-2 h-3 w-4/5 bg-slate-200 rounded"></div>
                      <div className="mt-4 h-3 w-24 bg-slate-200 rounded"></div>
                    </div>
                  ))}
                </div>
              )}
              {!loading && updates.length === 0 && (
                <div className="text-slate-700 text-sm bg-white border border-slate-200 rounded-2xl px-4 py-6 shadow-sm">
                  No live updates right now. Check back soon.
                </div>
              )}
              {!loading && updates.map((update) => (
                <div
                  key={update.id}
                  className={`min-w-[240px] max-w-[280px] snap-start bg-white backdrop-blur-lg border rounded-2xl p-4 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_28px_48px_-28px_rgba(0,0,0,0.28)] transition-all duration-200 cursor-pointer ${update.breaking ? 'border-rose-200/90' : 'border-slate-200/80'} ${typeBorders[update.type] ?? ''}`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <Badge variant="outline" className={`${typeStyles[update.type] ?? 'bg-slate-100 text-slate-800 border-slate-200'} font-semibold tracking-wide px-2 py-[3px]`}>{update.type}</Badge>
                    {update.breaking && (
                      <span className="relative inline-flex items-center text-rose-600 font-semibold">
                        <span className="mr-1 relative flex h-2 w-2">
                          <span className="animate-[ping_1.6s_ease-in-out_infinite] absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-70"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        Breaking
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-slate-900 text-sm font-semibold leading-5 line-clamp-2">
                    {update.title}
                  </div>
                  <div className="mt-3 text-[11px] text-slate-500">{formatDate(update.date)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
