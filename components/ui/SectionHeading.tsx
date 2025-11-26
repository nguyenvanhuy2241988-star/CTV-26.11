
import React from 'react';

interface SectionHeadingProps {
  title: string;
  description: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ title, description }) => {
  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 text-text-main tracking-tight">{title}</h2>
      <div className="w-24 h-1.5 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full mb-6 opacity-80"></div>
      <p className="text-base md:text-lg text-text-muted max-w-[640px] mx-auto leading-relaxed font-medium text-gray-500">{description}</p>
    </div>
  );
};

export default SectionHeading;
