"use client"
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {useTranslations} from 'next-intl';
import MainLayout from "@/components/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as LucideIcons from 'lucide-react';
import * as SimpleIcons from '@icons-pack/react-simple-icons';

interface Props {
  locale: string;
}

export default function ContactClientWrapper({ locale }: Props) {
    const t = useTranslations();
    const { data: contactItems, isLoading } = useQuery(trpc.content.getContact.queryOptions());
    
    const activeContacts = contactItems || [];
  
    return (
      <MainLayout>
        <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            {t('contact.title')}
          </h1>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {t('contact.directContact')}
                  </h2>
                  
                  <div className="space-y-2">
                    {activeContacts.map((contact) => {
                      const getIcon = (iconName: string | null | undefined, iconProvider: string | null | undefined, size = 22) => {
                        if (!iconName) return <LucideIcons.AtSign size={size} className="text-red-600 dark:text-red-400" />;
                        
                        if (iconProvider === 'lucide') {
                          const LucideIcon = (LucideIcons as any)[iconName];
                          if (LucideIcon) return <LucideIcon size={size} className="text-red-600 dark:text-red-400" />;
                        } else if (iconProvider === 'simple-icons') {
                          const SimpleIcon = (SimpleIcons as any)[iconName];
                          if (SimpleIcon) return <SimpleIcon size={size} className="text-red-600 dark:text-red-400" />;
                        }
                        
                        return <LucideIcons.AtSign size={size} className="text-red-600 dark:text-red-400" />;
                      };
                      
                      const contactIcon = getIcon(contact.iconName, contact.iconProvider);
                      
                      return (
                        <div key={contact.id} className="flex items-center justify-start gap-3">
                          <div className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
                            {contactIcon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {contact.url ? (
                                <a 
                                  href={contact.url} 
                                  target={contact.newTab ? "_blank" : undefined} 
                                  rel={contact.external ? "noopener noreferrer" : undefined} 
                                  className="hover:text-red-600 dark:hover:text-red-400 hover:underline cursor-pointer"
                                >
                                  {contact.name?.[locale as 'pl' | 'en']}
                                </a>
                              ) : (
                                contact.name?.[locale as 'pl' | 'en']
                              )}
                            </h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {t('contact.quickMessage')}
                  </h2>
                  
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="name">{t('contact.form.name')}</Label>
                      <Input
                        type="text"
                        id="name"
                        placeholder={t('contact.form.name')}
                      />
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="email">{t('contact.form.email')}</Label>
                      <Input
                        type="email"
                        id="email"
                        placeholder={t('contact.form.email')}
                      />
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="message">{t('contact.form.message')}</Label>
                      <Textarea
                        id="message"
                        placeholder={t('contact.form.message')}
                        className="min-h-[120px]"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                      {t('contact.form.send')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    );
} 