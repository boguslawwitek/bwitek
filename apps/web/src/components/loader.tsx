import { Icon } from '@/components/icon';

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <Icon name="Loader" provider="lu" className="animate-spin" />
    </div>
  );
}
