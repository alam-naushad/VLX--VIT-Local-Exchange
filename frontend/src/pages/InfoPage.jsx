import React from 'react';

const InfoPage = ({ title, subtitle, children }) => {
  return (
    <div className="w-full">
      <section className="px-6 lg:px-20 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-on-background text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-on-surface-variant text-lg lg:text-xl leading-relaxed max-w-3xl mb-12">
              {subtitle}
            </p>
          )}

          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/15 shadow-sm p-8 lg:p-12">
            <div className="prose prose-slate max-w-none">
              <div className="text-on-surface-variant text-sm leading-relaxed">{children}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InfoPage;

