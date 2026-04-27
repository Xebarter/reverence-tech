import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8 text-center">
        <div className="text-[#1C3D5A] font-black text-3xl mb-2">Page not found</div>
        <div className="text-slate-500 font-medium mb-8">
          The page you’re looking for doesn’t exist or may have been moved.
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[#1C3D5A] text-white font-black rounded-2xl hover:bg-yellow-500 hover:text-[#1C3D5A] transition-all"
          >
            Go home
          </Link>
          <Link
            href="/careers"
            className="px-6 py-3 border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition-all"
          >
            Careers
          </Link>
        </div>
      </div>
    </div>
  );
}

