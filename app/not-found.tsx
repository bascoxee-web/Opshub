import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white text-center">
      <h1 className="text-4xl font-extrabold text-teal-400 mb-2">404</h1>
      <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-400 mb-6 max-w-sm">
        The page or view you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
      >
        Return to GateDesk Dashboard
      </Link>
    </div>
  );
}
