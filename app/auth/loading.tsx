export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl animate-pulse">
        <div className="h-8 w-48 mx-auto rounded-xl bg-white/10" />
        <div className="mt-8 space-y-4">
          <div className="h-12 rounded-xl bg-white/10" />
          <div className="h-12 rounded-xl bg-white/10" />
          <div className="h-12 rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}
