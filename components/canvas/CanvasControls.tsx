'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Plus } from 'lucide-react';
import { useCards } from '@/components/providers/CardsProvider';
import { ThemeToggle } from '@/components/theme-toggle';

interface CanvasControlsProps {
  onResetZoom: () => void;
}

export function CanvasControls({ onResetZoom }: CanvasControlsProps) {
  const { state, addCard } = useCards();

  const handleAddCard = () => {
    // Add card at center of current view
    const centerX = 200;
    const centerY = 200;
    addCard(undefined, { x: centerX, y: centerY });
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        {/* Action buttons group */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddCard}
            className="h-8 w-8 p-0"
            title="Add Card (Double-click canvas)"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetZoom}
            className="h-8 w-8 p-0"
            title="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Separator */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-600" />
        
        {/* Info and settings group */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {Math.round(state.zoom * 100)}%
          </div>
          
          <ThemeToggle />
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded px-2 py-1 shadow-sm border border-gray-200 dark:border-gray-700">
        <div>Double-click to add card</div>
        <div>Drag cards to move</div>
        <div>Scroll to zoom</div>
      </div>
    </div>
  );
}
