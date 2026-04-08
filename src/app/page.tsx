import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Voice<span className="text-primary">Cast</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Describe a voice, hear it instantly. Age 1 to 100.
          Every emotion. Every character archetype.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/studio/voices"
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Open Studio
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Powered by Qwen3-TTS · Self-hosted · No per-character fees
        </p>
      </div>
    </div>
  );
}
