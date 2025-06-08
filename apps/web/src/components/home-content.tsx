"use client"
import dynamic from 'next/dynamic';

const AboutMeSection = dynamic(() => import('@/components/about-me-section'), {
  loading: () => <div className="h-[200px]" />,
});

interface HomeContentProps {
  welcomeText: string;
  specializationText: string;
  aboutMeText: string;
}

export default function HomeContent({ 
  welcomeText, 
  specializationText, 
  aboutMeText 
}: HomeContentProps) {
  return (
    <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-12">
      <section className="mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {welcomeText}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {specializationText}
        </p>
      </section>

      <section className="mb-16">
        <AboutMeSection content={aboutMeText} />
      </section>
    </div>
  );
} 