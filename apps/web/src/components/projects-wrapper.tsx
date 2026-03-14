"use client"
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useTranslations } from 'next-intl';
import type { Locale } from '@/lib/types';
import MainLayout from "@/components/main-layout";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Icon } from '@/components/icon';
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Props {
  locale: Locale;
}

export default function ProjectsClientWrapper({ locale }: Props) {
  const t = useTranslations();
  const { data: projects, isLoading } = useQuery(trpc.content.getProjects.queryOptions());
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const activeProjects = projects?.filter(project => project.isActive) || [];

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <MainLayout>
      <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          {t('pages.projects.title')}
        </h1>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : activeProjects.length > 0 ? (
          <div className="space-y-3">
            {activeProjects.map((project) => {
              const isOpen = openIds.has(project.id);
              return (
                <Collapsible key={project.id} open={isOpen} onOpenChange={() => toggle(project.id)}>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                        <h2 className="text-base font-bold font-mono text-gray-900 dark:text-gray-100">
                          {project.title[locale]}
                        </h2>
                        <div className="flex items-center gap-2 shrink-0">
                          {project.url && (
                            <span
                              role="link"
                              onClick={(e) => { e.stopPropagation(); window.open(project.url!, '_blank', 'noopener,noreferrer'); }}
                              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                              <Icon name="ExternalLink" provider="lu" size={12} />
                              {t('pages.projects.demo')}
                            </span>
                          )}
                          {project.repoUrl && (
                            <span
                              role="link"
                              onClick={(e) => { e.stopPropagation(); window.open(project.repoUrl!, '_blank', 'noopener,noreferrer'); }}
                              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Icon name="github" provider="si" size={18} />
                            </span>
                          )}
                          {project.repoUrl2 && (
                            <span
                              role="link"
                              onClick={(e) => { e.stopPropagation(); window.open(project.repoUrl2!, '_blank', 'noopener,noreferrer'); }}
                              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Icon name="gitea" provider="si" size={18} />
                            </span>
                          )}
                          <Icon
                            name="ChevronDown"
                            provider="lu"
                            size={16}
                            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none project-markdown">
                          <ReactMarkdown
                            components={{
                              a: ({ children, ...props }) => {
                                const hasImage = Array.isArray(children) &&
                                  children.length > 0 &&
                                  typeof children[0] === 'object' &&
                                  children[0] !== null &&
                                  'type' in children[0] &&
                                  children[0].type === 'img';
                                return (
                                  <a target="_blank" rel="noopener noreferrer" className={hasImage ? 'inline-block' : undefined} {...props}>
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
                              ),
                            }}
                          >
                            {project.description[locale]}
                          </ReactMarkdown>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4 sm:hidden">
                          {project.repoUrl && (
                            <Button variant="outline" size="sm" className="font-mono text-xs"
                              onClick={() => window.open(project.repoUrl!, '_blank', 'noopener,noreferrer')}>
                              <Icon name="github" provider="si" className="text-rose-600 dark:text-rose-400" />
                              GitHub
                            </Button>
                          )}
                          {project.repoUrl2 && (
                            <Button variant="outline" size="sm" className="font-mono text-xs"
                              onClick={() => window.open(project.repoUrl2!, '_blank', 'noopener,noreferrer')}>
                              <Icon name="gitea" provider="si" className="text-rose-600 dark:text-rose-400" />
                              Gitea
                            </Button>
                          )}
                          {project.url && (
                            <Button variant="outline" size="sm" className="font-mono text-xs"
                              onClick={() => window.open(project.url!, '_blank', 'noopener,noreferrer')}>
                              <Icon name="ExternalLink" provider="lu" className="text-rose-600 dark:text-rose-400" />
                              {t('pages.projects.demo')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            {t('pages.projects.noProjects')}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
