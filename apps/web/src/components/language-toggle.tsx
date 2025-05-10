import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Languages } from 'lucide-react';

const LANGUAGES = {
  pl: 'Polski',
  en: 'English'
} as const;

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex gap-2 w-auto px-2">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="hidden sm:inline-block">{LANGUAGES[currentLang as keyof typeof LANGUAGES]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(LANGUAGES).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => i18n.changeLanguage(code)}
            className="flex items-center gap-2"
          >
            {name}
            {currentLang === code && (
              <span className="ml-auto text-green-500">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
