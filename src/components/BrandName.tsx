import React from 'react';

interface BrandNameProps {
  name: string;
}

export default function BrandName({ name }: BrandNameProps) {
  const parts = name.split('©');
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && <span className="text-[0.8em] align-super leading-none">©</span>}
        </React.Fragment>
      ))}
    </>
  );
}
