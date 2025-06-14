"use client"
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {useTranslations} from 'next-intl';
import MainLayout from "@/components/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TurnstileWrapper, type TurnstileRef } from "@/components/turnstile";
import { Icon } from '@/components/icon';
import { useState, useRef } from "react";
import { toast } from "sonner";

interface Props {
  locale: string;
}

interface FormData {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
}

export default function ContactClientWrapper({ locale }: Props) {
    const t = useTranslations();
    const { data: contactItems, isLoading } = useQuery(trpc.content.getContact.queryOptions());
    const turnstileRef = useRef<TurnstileRef>(null);
    
    const [formData, setFormData] = useState<FormData>({
      name: '',
      email: '',
      message: '',
      turnstileToken: ''
    });

    const [errors, setErrors] = useState<Partial<FormData>>({});
    
    const activeContacts = contactItems || [];

    const sendEmailMutation = useMutation(
      trpc.mail.sendContactForm.mutationOptions({
        onSuccess: () => {
          toast.success(t('pages.contact.form.success'));
          setFormData({ name: '', email: '', message: '', turnstileToken: '' });
          setErrors({});
          turnstileRef.current?.reset();
        },
        onError: (error) => {
          toast.error(t('pages.contact.form.error'));
          console.error('Error sending email:', error);
        }
      })
    );

    const validateForm = (): boolean => {
      const newErrors: Partial<FormData> = {};

      if (!formData.name.trim()) {
        newErrors.name = t('components.validation.required');
      }

      if (!formData.email.trim()) {
        newErrors.email = t('components.validation.required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('components.validation.invalid');
      }

      if (!formData.message.trim()) {
        newErrors.message = t('components.validation.required');
      } else if (formData.message.trim().length < 10) {
        newErrors.message = t('components.validation.minLength', { min: 10 });
      }

      if (!formData.turnstileToken) {
        newErrors.turnstileToken = t('components.validation.turnstileRequired');
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      sendEmailMutation.mutate(formData);
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

    const handleTurnstileVerify = (token: string) => {
      handleInputChange('turnstileToken', token);
    };

    const handleTurnstileError = () => {
      handleInputChange('turnstileToken', '');
    };
  
    return (
      <MainLayout>
        <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            {t('pages.contact.title')}
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
                    {t('pages.contact.directContact')}
                  </h2>
                  
                  <div className="space-y-2">
                    {activeContacts.map((contact) => {
                      const getIcon = (iconName: string | null | undefined, iconProvider: string | null | undefined, size = 22) => {
                        if (!iconName) return <Icon name="AtSign" provider="lu" className="text-rose-600 dark:text-rose-400" />;
                        
                        if (iconProvider === 'lucide') {
                          return <Icon name={iconName} provider="lu" className="text-rose-600 dark:text-rose-400" />;
                        } else if (iconProvider === 'simple-icons') {
                          return <Icon name={iconName} provider="si" className="text-rose-600 dark:text-rose-400" />;
                        }
                        
                        return <Icon name="AtSign" provider="lu" className="text-rose-600 dark:text-rose-400" />;
                      };
                      
                      const contactIcon = getIcon(contact.iconName, contact.iconProvider);
                      
                      return (
                        <div key={contact.id} className="flex items-center justify-start gap-3">
                          <div className="mt-1 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-full">
                            {contactIcon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {contact.url ? (
                                <a 
                                  href={contact.url} 
                                  target={contact.newTab ? "_blank" : undefined} 
                                  rel={contact.external ? "noopener noreferrer" : undefined} 
                                  className="hover:text-rose-600 dark:hover:text-rose-400 hover:underline cursor-pointer"
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
                    {t('pages.contact.quickMessage')}
                  </h2>
                  
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="name">{t('pages.contact.form.name')}</Label>
                      <Input
                        type="text"
                        id="name"
                        placeholder={t('pages.contact.form.name')}
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={errors.name ? 'border-rose-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-rose-500">{errors.name}</p>
                      )}
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="email">{t('pages.contact.form.email')}</Label>
                      <Input
                        type="email"
                        id="email"
                        placeholder={t('pages.contact.form.email')}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-rose-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-rose-500">{errors.email}</p>
                      )}
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="message">{t('pages.contact.form.message')}</Label>
                      <Textarea
                        id="message"
                        placeholder={t('pages.contact.form.message')}
                        className={`min-h-[120px] ${errors.message ? 'border-rose-500' : ''}`}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                      />
                      {errors.message && (
                        <p className="text-sm text-rose-500">{errors.message}</p>
                      )}
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <TurnstileWrapper
                        ref={turnstileRef}
                        onVerify={handleTurnstileVerify}
                        onError={handleTurnstileError}
                        onExpire={handleTurnstileError}
                      />
                      {errors.turnstileToken && (
                        <p className="text-sm text-rose-500">{errors.turnstileToken}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                      disabled={sendEmailMutation.isPending}
                    >
                      {sendEmailMutation.isPending ? t('common.saving') : t('pages.contact.form.send')}
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