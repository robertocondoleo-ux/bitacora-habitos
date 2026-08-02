export default function LoadingScreen({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-40 h-10 mx-auto mb-3 overflow-hidden">
          <div className="absolute inset-x-1 bottom-1.5 h-1 bg-line rounded-full" />
          <div className="loading-walker-track">
            <span className="loading-walker-bob text-2xl">🚶</span>
          </div>
        </div>
        <p className="font-mono text-sm text-soft">{label}</p>
      </div>
    </div>
  );
}
