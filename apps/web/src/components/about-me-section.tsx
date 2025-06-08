"use client"

interface AboutMeSectionProps {
  content: string;
}

export default function AboutMeSection({ content }: AboutMeSectionProps) {
  if (!content) return null;

  return (
    <div 
      className="prose dark:prose-invert max-w-none"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '0 2000px'
      }}
    >
      {content}
    </div>
  );
} 