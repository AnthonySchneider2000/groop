'use client';

import React, { useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useCards } from '@/components/providers/CardsProvider';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { getAbsolutePositionForCard, isChildOutsideParent } from '@/lib/utils';
import { Card } from './Card';
import { CanvasControls } from './CanvasControls';

interface InfiniteCanvasProps {
  children?: React.ReactNode;
}

export function InfiniteCanvas({ children }: InfiniteCanvasProps) {
  const { state, moveCard, selectCard, addCard, dispatch } = useCards();
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    const cardId = active.id as string;
    const card = state.cards[cardId];
    
    if (!card || !delta) return;
    
    // Check if the card should be orphaned (child dragged outside parent)
    if (card.parentId) {
      const parentCard = state.cards[card.parentId];
      if (parentCard) {
        // Create updated card with new position after drag
        const updatedCard = {
          ...card,
          position: {
            x: card.position.x + delta.x,
            y: card.position.y + delta.y
          }
        };
        
        if (isChildOutsideParent(updatedCard, parentCard, state.cards)) {
          // Calculate the final absolute position for orphaning
          const currentAbsolutePos = getAbsolutePositionForCard(parentCard, state.cards);
          const finalAbsolutePosition = {
            x: currentAbsolutePos.x + card.position.x + delta.x,
            y: currentAbsolutePos.y + card.position.y + delta.y
          };
          
          // Orphan the card - convert to absolute positioning
          dispatch({ 
            type: 'SET_PARENT', 
            payload: { cardId, parentId: null } 
          });
          dispatch({
            type: 'UPDATE_CARD',
            payload: { 
              cardId, 
              updates: { position: finalAbsolutePosition }
            }
          });
          return;
        }
      }
    }
    
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
        // Get the current absolute position of the card after drag
        const parentCard = card.parentId ? state.cards[card.parentId] : null;
        const currentAbsoluteX = (parentCard ? 
          getAbsolutePositionForCard(parentCard, state.cards).x + card.position.x :
          card.position.x) + delta.x;
        const currentAbsoluteY = (parentCard ? 
          getAbsolutePositionForCard(parentCard, state.cards).y + card.position.y :
          card.position.y) + delta.y;
        
        // Get target card's absolute position
        const targetCard = state.cards[targetCardId];
        const targetAbsPos = getAbsolutePositionForCard(targetCard, state.cards);
        
        // Calculate position relative to the new parent
        const relativePosition = {
          x: currentAbsoluteX - targetAbsPos.x,
          y: currentAbsoluteY - targetAbsPos.y,
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
    if (card.parentId) {
      // For child cards, update relative position
      const newRelativePosition = {
        x: card.position.x + delta.x,
        y: card.position.y + delta.y,
      };
      dispatch({
        type: 'UPDATE_CARD',
        payload: { 
          cardId, 
          updates: { position: newRelativePosition }
        }
      });
    } else {
      // For root cards, update absolute position
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
    if (event.target === event.currentTarget) {
      // Get the click position relative to the canvas
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Convert screen coordinates to canvas coordinates
      let canvasX = x;
      let canvasY = y;
      
      if (transformRef.current && transformRef.current.state) {
        const transform = transformRef.current.state;
        canvasX = (x - transform.positionX) / transform.scale;
        canvasY = (y - transform.positionY) / transform.scale;
      }
      
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
