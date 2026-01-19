"use client";
import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

      {/* Green accent shapes */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl"></div>

      <div className="max-w-2xl relative z-10">
        {/* Small green tag */}
        <div className="inline-block mb-6">
          <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
            Error 404
          </span>
        </div>

        <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-green-600 bg-clip-text text-transparent">
          Page not found
        </h1>

        <p className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
          Sorry, we couldnot find the page you are looking for. It might have
          been removed, renamed, or never existed.
        </p>

        <div className="flex flex-wrap gap-4 mb-16">
          <Link
            href="/"
            className="group px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-green-600/30 hover:shadow-green-600/40 hover:-translate-y-0.5"
          >
            Take me home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all border-2 border-gray-200 hover:border-gray-300"
          >
            Go back
          </button>
        </div>

        {/* Bottom decorative element */}
        <div className="flex items-center gap-4 pt-8 border-t border-gray-200">
          <div className="flex-1 h-px bg-linear-to-r from-green-500 to-transparent"></div>
          <span className="text-sm text-gray-400 font-mono">404</span>
          <div className="flex-1 h-px bg-linear-to-l from-green-500 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
