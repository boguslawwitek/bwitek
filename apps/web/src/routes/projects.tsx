import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useTranslation } from "react-i18next";
import MainLayout from "@/components/layouts/main-layout";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { SiGithub, SiGitea } from '@icons-pack/react-simple-icons';

import { useEffect } from "react";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .project-markdown p {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
        margin-top: 0.25rem;
      }

      .project-markdown {
        line-height: 1.6;
        font-size: 0.9375rem;
      }

      .project-markdown p {
        margin-bottom: 1rem;
        color: rgb(55 65 81);
        white-space: normal;
      }

      .project-markdown ul {
        margin-top: 0.5rem;
        margin-bottom: 1rem;
        list-style-type: disc;
        padding-left: 1.5rem;
      }

      .project-markdown li {
        margin-bottom: 0.25rem;
      }

      .dark .project-markdown p {
        color: rgb(209 213 219);
      }

      .project-markdown h1 {
        font-family: monospace;
        color: rgb(17 24 39);
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-weight: 600;
        font-size: 1.5rem;
      }

      .project-markdown h2 {
        font-family: monospace;
        color: rgb(17 24 39);
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
        font-size: 1.25rem;
      }

      .project-markdown h3 {
        font-family: monospace;
        color: rgb(31 41 55);
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
        font-size: 1.125rem;
      }

      .project-markdown h4 {
        font-family: monospace;
        color: rgb(31 41 55);
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
        font-size: 1rem;
      }

      .dark .project-markdown h1,
      .dark .project-markdown h2,
      .dark .project-markdown h3,
      .dark .project-markdown h4 {
        color: rgb(229 229 229);
      }

      .project-markdown p a {
        background-color: rgb(254 242 242);
        color: rgb(220 38 38);
        text-decoration: none;
        border-radius: 0.25rem;
        font-size: 0.875rem;
      }

      .dark .project-markdown p a {
        background-color: transparent;
        color: rgb(248 113 113);
      }

      .project-markdown p a:hover {
        background-color: rgb(254 226 226);
      }

      .dark .project-markdown p a:hover {
        background-color: transparent;
      }

      .project-markdown p:has(a:first-child:last-child) {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .project-markdown p a img {
        border-radius: 0.375rem;
        transition: transform 0.2s;
      }

      .project-markdown p a:hover img {
        transform: scale(1.02);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'en';
  const { data: projects, isLoading } = useQuery(trpc.content.getProjects.queryOptions());
  
  const activeProjects = projects?.filter(project => project.isActive) || [];

  return (
    <MainLayout>
      <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          {t('projects.title')}
        </h1>
        
        {isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {activeProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors bg-white dark:bg-gray-900 p-6 gap-3">
                <CardContent className="px-6">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                    <h2 className="-ml-5 text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">
                      {project.title[locale]}
                    </h2>
                  </div>

                  <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none project-markdown">
                        <ReactMarkdown
                          components={{
                            a: ({ node, children, ...props }) => {
                              const hasImage = Array.isArray(children) && 
                                children.length > 0 && 
                                typeof children[0] === 'object' && 
                                children[0] !== null && 
                                'type' in children[0] && 
                                children[0].type === 'img';
                              return (
                                <a 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={hasImage ? 'inline-block' : undefined}
                                  {...props}
                                >
                                  {children}
                                </a>
                              );
                            },
                            h1: ({ node, ...props }) => (
                              <h1 className="font-mono text-gray-700 dark:text-gray-200 text-xl font-semibold" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="font-mono text-gray-700 dark:text-gray-200 text-lg font-semibold" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="font-mono text-gray-700 dark:text-gray-200 text-base font-semibold" {...props} />
                            ),
                            h4: ({ node, ...props }) => (
                              <h4 className="font-mono text-gray-700 dark:text-gray-200 text-sm font-semibold" {...props} />
                            )
                          }}
                        >
                          {project.description[locale]}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-3 px-6">
                  {project.repoUrl && (
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="bg-gray-100 dark:bg-gray-800 font-mono text-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => project.repoUrl && window.open(project.repoUrl, '_blank', 'noopener,noreferrer')}
                    >
                      <SiGithub className="w-3.5 h-3.5 mr-1.5 text-red-600 dark:text-red-400" />
                      {t('projects.github', "GitHub")}
                    </Button>
                  )}
                  {project.repoUrl2 && (
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="bg-gray-100 dark:bg-gray-800 font-mono text-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => project.repoUrl2 && window.open(project.repoUrl2, '_blank', 'noopener,noreferrer')}
                    >
                      <SiGitea className="w-3.5 h-3.5 mr-1.5 text-red-600 dark:text-red-400" />
                      {t('projects.gitea', "Gitea")}
                    </Button>
                  )}
                  {project.url && (
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="bg-gray-100 dark:bg-gray-800 font-mono text-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => project.url && window.open(project.url, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-red-600 dark:text-red-400" />
                      {t('projects.demo', "Demo")}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            {t('projects.noProjects')}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
