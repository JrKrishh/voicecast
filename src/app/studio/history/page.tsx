export default function HistoryPage() {
  return (
    <div className="px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">Generation History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your past voice generations will appear here.
        </p>
        <div className="mt-8 py-16 text-center border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No generations yet</p>
          <a href="/studio/dialogue" className="text-xs text-primary hover:text-primary/80 mt-2 inline-block">
            Go to Dialogue Studio →
          </a>
        </div>
      </div>
    </div>
  );
}
