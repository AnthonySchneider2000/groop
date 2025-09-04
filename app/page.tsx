import { CardsProvider } from '@/components/providers/CardsProvider';
import { InfiniteCanvas } from '@/components/canvas/InfiniteCanvas';

export default function Home() {
  return (
    <CardsProvider>
      <div className="w-full h-screen">
        <InfiniteCanvas />
      </div>
    </CardsProvider>
  );
}
