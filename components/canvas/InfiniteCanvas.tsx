'use client';

import React, { useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useCards } from '@/components/providers/CardsProvider';
import { DndContext, DragEndEvent, DragStartEvent, DragOverEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Card } from './Card';
import { CanvasControls } from './CanvasControls';

interface InfiniteCanvasProps {
  children?: React.ReactNode;
}

export function InfiniteCanvas({ children }: InfiniteCanvasProps) {
  const { state, moveCard, selectCard, addCard, dispatch } = useCards();
  const transformRef = useRef<any>(null);
  const [dragOverCardId, setDragOverCardId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const cardId = event.active.id as string;
    selectCard(cardId);
  }, [selectCard]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    
    if (over && over.data.current?.type === 'card-drop') {
      const overId = over.data.current.cardId as string;
      setDragOverCardId(overId !== activeId ? overId : null);
    } else {
      setDragOverCardId(null);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    const cardId = active.id as string;
    const card = state.cards[cardId];
    
    setDragOverCardId(null);
    
    // Check if dropped on another card for nesting
    if (over && over.data.current?.type === 'card-drop') {
      const targetCardId = over.data.current.cardId as string;
      
      // Prevent nesting a card into itself or its descendants
      const isValidTarget = (targetId: string, sourceId: string): boolean => {
        if (targetId === sourceId) return false;
        const targetCard = state.cards[targetId];
        if (!targetCard) return false;
        
        // Check if target is a descendant of source
        const checkDescendant = (checkId: string): boolean => {
          const checkCard = state.cards[checkId];
          if (!checkCard) return false;
          if (checkCard.parentId === sourceId) return true;
          if (checkCard.parentId) return checkDescendant(checkCard.parentId);
          return false;
        };
        
        return !checkDescendant(targetId);
      };
      
      if (isValidTarget(targetCardId, cardId)) {
        // Calculate position relative to the parent card
        const targetCard = state.cards[targetCardId];
        const relativePosition = {
          x: card.position.x - targetCard.position.x,
          y: card.position.y - targetCard.position.y,
        };
        
        // Update the card's parent and position
        dispatch({ 
          type: 'SET_PARENT', 
          payload: { cardId, parentId: targetCardId } 
        });
        dispatch({
          type: 'UPDATE_CARD',
          payload: { 
            cardId, 
            updates: { position: relativePosition }
          }
        });
        return;
      }
    }
    
    // Regular movement if not dropped on a valid target
    if (card && delta) {
      const newPosition = {
        x: card.position.x + delta.x,
        y: card.position.y + delta.y,
      };
      moveCard(cardId, newPosition);
    }
  }, [state.cards, moveCard, dispatch]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Only handle clicks on the canvas itself, not on cards
    if (event.target === event.currentTarget) {
      selectCard(null);
    }
  }, [selectCard]);

  const handleCanvasDoubleClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && transformRef.current) {
      // Get the click position relative to the canvas
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Convert screen coordinates to canvas coordinates
      const transform = transformRef.current.state;
      const canvasX = (x - transform.positionX) / transform.scale;
      const canvasY = (y - transform.positionY) / transform.scale;
      
      addCard(undefined, { x: canvasX, y: canvasY });
    }
  }, [addCard]);

  const resetZoom = useCallback(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
    dispatch({ type: 'RESET_ZOOM' });
  }, [dispatch]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <CanvasControls onResetZoom={resetZoom} />
      
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.1}
        maxScale={5}
        centerOnInit={false}
        limitToBounds={false}
        doubleClick={{ disabled: true }}
        wheel={{ step: 0.1 }}
        onTransformed={(ref) => {
          dispatch({ 
            type: 'SET_ZOOM', 
            payload: { zoom: ref.state.scale } 
          });
          dispatch({ 
            type: 'SET_PAN', 
            payload: { 
              pan: { x: ref.state.positionX, y: ref.state.positionY } 
            } 
          });
        }}
      >
        <TransformComponent
          wrapperClass="w-full h-full"
          contentClass="w-full h-full relative"
        >
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              className="relative w-[5000px] h-[5000px] cursor-grab active:cursor-grabbing"
              onClick={handleCanvasClick}
              onDoubleClick={handleCanvasDoubleClick}
              style={{
                backgroundImage: `
                  radial-gradient(circle, #cbd5e1 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0',
              }}
            >
              {Object.values(state.cards).map((card) => (
                <Card key={card.id} card={card} />
              ))}
              {children}
            </div>
          </DndContext>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
