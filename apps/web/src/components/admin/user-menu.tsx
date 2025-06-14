import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {Link, useRouter} from '@/i18n/navigation';
import { useTranslations } from "next-intl";

export default function UserMenu() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Button variant="outline" asChild>
        <Link href="/login">{t('components.userMenu.signIn')}</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{session.user.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuLabel>{t('components.userMenu.myAccount')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/login");
                  },
                },
              });
            }}
          >
            {t('components.userMenu.signOut')}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
