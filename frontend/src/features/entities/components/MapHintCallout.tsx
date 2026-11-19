'use client';

import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MapHintCallout() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="pointer-events-auto absolute top-4 right-4 z-1000">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => setDismissed(false)}
          className="h-9 w-9 rounded-full border bg-background/95 shadow-lg backdrop-blur-md hover:bg-accent"
          aria-label="Tampilkan petunjuk peta"
          title="Klik di mana saja pada peta untuk menambah entitas baru"
        >
          <Info className="h-4 w-4 text-primary" />
        </Button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto absolute top-4 right-4 z-1000 flex max-w-xs items-start gap-2.5 rounded-2xl border bg-background/95 px-3.5 py-2.5 text-xs shadow-lg backdrop-blur-md">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1 leading-relaxed text-foreground/90">
        Klik di mana saja pada peta untuk menambah entitas baru
      </p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setDismissed(true)}
        className="h-6 w-6 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
        aria-label="Tutup petunjuk"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
