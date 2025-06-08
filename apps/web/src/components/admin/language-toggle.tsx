import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/icon';
import {useTranslations, useLocale} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';
import {useParams} from 'next/navigation';

const LANGUAGES = {
  pl: 'Polski',
  en: 'English'
} as const;

export function LanguageToggle() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex gap-2 w-auto px-2">
          <Icon name="Languages" provider="lu" className="h-[1.2rem] w-[1.2rem]" />
          <span className="hidden sm:inline-block">{LANGUAGES[locale as keyof typeof LANGUAGES]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(LANGUAGES).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => router.replace(
              // @ts-expect-error -- TypeScript will validate that only known `params`
              // are used in combination with a given `pathname`. Since the two will
              // always match for the current route, we can skip runtime checks.
              {pathname, params}, {locale: code})}
            className="flex items-center gap-2"
          >
            {name}
            {locale === code && (
              <span className="ml-auto text-green-500">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
