export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-72 rounded-2xl bg-white/10" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-32 rounded-3xl bg-white/5" />
        <div className="h-32 rounded-3xl bg-white/5" />
        <div className="h-32 rounded-3xl bg-white/5" />
        <div className="h-32 rounded-3xl bg-white/5" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-80 rounded-[36px] bg-white/5 xl:col-span-2" />
        <div className="h-80 rounded-[36px] bg-white/5" />
      </div>
    </div>
  );
}
