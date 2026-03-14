export default function SkeletonCard() {
  return (
    <div className="bg-terminal-panel dark:bg-[#111] border border-terminal-border px-5 pt-4 pb-2.5 animate-pulse">
      {/* Title row */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-md bg-terminal-border/40 dark:bg-white/10 shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-terminal-border/40 dark:bg-white/10 rounded w-4/5 mb-1.5" />
          <div className="h-4 bg-terminal-border/40 dark:bg-white/10 rounded w-3/5" />
        </div>
      </div>
      {/* Badge */}
      <div className="h-6 bg-terminal-border/40 dark:bg-white/10 rounded-full w-20 mb-3" />
      {/* Prob bar */}
      <div className="flex justify-between mb-1.5">
        <div className="h-3 bg-terminal-border/40 dark:bg-white/10 rounded w-16" />
        <div className="h-5 bg-terminal-border/40 dark:bg-white/10 rounded w-14" />
      </div>
      <div className="h-2 bg-terminal-border/40 dark:bg-white/10 rounded-full mb-3" />
      {/* Stats */}
      <div className="h-14 bg-terminal-border/40 dark:bg-white/10 rounded-lg" />
    </div>
  );
}
