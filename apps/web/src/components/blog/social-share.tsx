"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Icon } from '@/components/icon';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export default function SocialShare({ url, title, description }: SocialShareProps) {
  const t = useTranslations('blog.share');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const shareData = {
    title,
    text: description || title,
    url
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('linkCopied'));
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareOnFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const shareOnTwitter = () => {
    const text = `${title}${description ? ' - ' + description : ''}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const shareOnLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const shareOnWhatsApp = () => {
    const text = `${title}${description ? ' - ' + description : ''} ${url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description || title}\n\n${url}`);
    const shareUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = shareUrl;
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className="flex items-center gap-2 w-50"
      >
        <Icon name="Share2" provider="lu" className="h-4 w-4" />
        {t('title')}
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 right-0 z-50 w-50 shadow-lg border p-0 bg-sidebar">
          <CardContent className="p-2">
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={shareOnFacebook}
                className="w-full justify-start gap-3 h-10 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <Icon name="Facebook" provider="si" className="h-4 w-4 text-[#1877F2]" />
                <span className="text-sm">Facebook</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareOnTwitter}
                className="w-full justify-start gap-3 h-10 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Icon name="X" provider="si" className="h-4 w-4 text-foreground" />
                <span className="text-sm">X (Twitter)</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareOnLinkedIn}
                className="w-full justify-start gap-3 h-10 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <Icon name="Linkedin" provider="si" className="h-4 w-4 text-[#0A66C2]" />
                <span className="text-sm">LinkedIn</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareOnWhatsApp}
                className="w-full justify-start gap-3 h-10 hover:bg-green-50 dark:hover:bg-green-950/20"
              >
                <Icon name="Whatsapp" provider="si" className="h-4 w-4 text-[#25D366]" />
                <span className="text-sm">WhatsApp</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareViaEmail}
                className="w-full justify-start gap-3 h-10 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Icon name="Mail" provider="lu" className="h-4 w-4" />
                <span className="text-sm">E-mail</span>
              </Button>
              
              <div className="border-t pt-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="w-full justify-start gap-3 h-10 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  <Icon name="Copy" provider="lu" className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('copyLink')}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 