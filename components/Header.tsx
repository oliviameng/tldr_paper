import React, { useRef } from 'react';
import { CloseIcon } from './icons';

interface HeaderProps {
  userLogo: string | null;
  onLogoUpload: (logoDataUrl: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({ userLogo, onLogoUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onLogoUpload(reader.result as string);
      };
      reader.onerror = () => {
        console.error("Error reading file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleResetLogo = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the file picker from opening
    onLogoUpload(null);
     if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };


  return (
    <header>
      <h1 className="text-4xl md:text-5xl font-serif font-semibold text-slate-900 mb-2 flex items-center justify-start gap-4">
        <div 
          className="relative group cursor-pointer" 
          onClick={handleLogoClick}
          title="Click to change logo"
        >
          {userLogo ? (
            <>
              <img src={userLogo} alt="Custom logo" className="w-14 h-14 rounded-lg object-cover" />
              <button 
                onClick={handleResetLogo}
                className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-slate-500"
                title="Reset logo"
              >
                <CloseIcon />
              </button>
            </>
          ) : (
            <div className="w-14 h-14 rounded-lg bg-slate-200 flex items-center justify-center text-4xl" aria-label="TLDR Paper Logo">
              🎓
            </div>
          )}
        </div>
        TLDR Paper
      </h1>
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-hidden="true"
      />
      <p className="text-lg text-slate-600">PM Edition & Trend Tracker</p>
      <p className="mt-4 max-w-2xl text-slate-700">
        Decode any AI research paper or discover the top trending papers of the week.
      </p>
    </header>
  );
};

export default Header;