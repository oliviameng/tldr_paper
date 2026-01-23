import React from 'react';

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => {
  return (
    <section className="border-b border-slate-300 pb-8 last:border-b-0 last:pb-0">
      <header className="not-prose flex items-center gap-3 mb-4">
        <div className="text-slate-700">{icon}</div>
        <h2 className="text-2xl font-serif font-semibold text-slate-900">{title}</h2>
      </header>
      <div className="ml-[36px] text-slate-700">
        {children}
      </div>
    </section>
  );
};

export default SectionCard;