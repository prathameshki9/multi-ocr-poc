import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-600 text-sm font-semibold text-white">
            OCR
          </div>
          <div>
            <p className="text-lg font-semibold">Vision OCR</p>
            <p className="text-sm text-slate-500">Extract text from documents</p>
          </div>
        </div>
        <nav className="hidden gap-6 text-sm font-medium text-slate-600 sm:flex">
          <a href="#upload" className="hover:text-slate-900">
            Upload
          </a>
          <a href="#results" className="hover:text-slate-900">
            Results
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

