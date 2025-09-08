'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, GripVertical } from 'lucide-react';
import { useCards } from '@/components/providers/CardsProvider';
import { Card as CardType } from '@/lib/types';
import { cn, getAbsolutePositionForCard } from '@/lib/utils';

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  const {
    state,
    updateCard,
    deleteCard,
    addCard,
    startEditing,
    stopEditing,
    selectCard,
  } = useCards();
  
  const [title, setTitle] = useState(card.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isSelected = state.selectedCardId === card.id;
  const isEditing = card.isEditing;
  const hasChildren = card.childIds.length > 0;

  // Calculate card size based on content and children
  const calculateCardSize = useCallback(() => {
    const minWidth = 200;
    const minHeight = 120;
    const childPadding = 20;
    
    let maxChildX = 0;
    let maxChildY = 0;
    
    if (hasChildren) {
      card.childIds.forEach(childId => {
        const child = state.cards[childId];
        if (child) {
          const childRight = child.position.x + child.size.width;
          const childBottom = child.position.y + child.size.height;
          maxChildX = Math.max(maxChildX, childRight);
          maxChildY = Math.max(maxChildY, childBottom);
        }
      });
    }
    
    const calculatedWidth = Math.max(minWidth, maxChildX + childPadding);
    const calculatedHeight = Math.max(minHeight, maxChildY + childPadding);
    
    if (calculatedWidth !== card.size.width || calculatedHeight !== card.size.height) {
      updateCard(card.id, {
        size: { width: calculatedWidth, height: calculatedHeight }
      });
    }
  }, [card, state.cards, hasChildren, updateCard]);

  // Update card size when children change
  useEffect(() => {
    calculateCardSize();
  }, [calculateCardSize]);

  // Draggable setup
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: card.id,
    data: { type: 'card', card },
  });

  // Droppable setup for nesting
  const {
    setNodeRef: setDropRef,
    isOver,
  } = useDroppable({
    id: `${card.id}-drop`,
    data: { type: 'card-drop', cardId: card.id },
  });

  // Check if this card is currently being dragged
  const isBeingDragged = isDragging;

  // Combine refs
  const setRefs = useCallback((node: HTMLDivElement) => {
    setDragRef(node);
    setDropRef(node);
    cardRef.current = node;
  }, [setDragRef, setDropRef]);

  // Handle title editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleSubmit = useCallback(() => {
    updateCard(card.id, { title: title.trim() || 'Untitled' });
    stopEditing(card.id);
  }, [card.id, title, updateCard, stopEditing]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(card.title);
      stopEditing(card.id);
    }
  }, [handleTitleSubmit, card.title, stopEditing, card.id]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectCard(card.id);
  }, [selectCard, card.id]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleTitleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    startEditing(card.id);
  }, [startEditing, card.id]);

  const handleAddChild = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const childPosition = {
      x: 20,
      y: 60,
    };
    addCard(card.id, childPosition);
  }, [addCard, card.id]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCard(card.id);
  }, [deleteCard, card.id]);

  // Calculate absolute position considering parent relationships
  const getAbsolutePosition = useCallback(() => {
    if (!card.parentId) {
      return card.position;
    }
    
    const parent = state.cards[card.parentId];
    if (!parent) {
      return card.position;
    }
    
    const parentAbsPos = getAbsolutePositionForCard(parent, state.cards);
    return {
      x: parentAbsPos.x + card.position.x,
      y: parentAbsPos.y + card.position.y,
    };
  }, [card, state.cards]);

  const absolutePosition = getAbsolutePosition();
  
  const style = isDragging && transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setRefs}
      className={cn(
        'absolute bg-white dark:bg-gray-800 border-2 rounded-lg shadow-lg transition-all duration-200',
        isSelected 
          ? 'border-blue-500 shadow-blue-200 dark:shadow-blue-900' 
          : 'border-gray-200 dark:border-gray-600',
        isOver && !isBeingDragged && 'border-green-400 bg-green-50 dark:bg-green-900/20',
        isDragging && 'opacity-50 z-50',
        'hover:shadow-xl'
      )}
      style={{
        left: absolutePosition.x,
        top: absolutePosition.y,
        width: card.size.width,
        height: card.size.height,
        zIndex: card.zIndex + (isDragging ? 1000 : 0),
        ...style,
      }}
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
    >
      {/* Card Header */}
      <div 
        className={cn(
          'flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-md',
          'cursor-move'
        )}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="h-4 w-4 text-gray-400" />
          
          {isEditing ? (
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="h-6 text-sm font-medium bg-transparent border-none p-0 focus:ring-0"
              placeholder="Card title..."
            />
          ) : (
            <h3 
              className="text-sm font-medium truncate cursor-text select-none"
              onDoubleClick={handleTitleDoubleClick}
              title={card.title}
            >
              {card.title}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddChild}
            className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
            title="Add child card"
          >
            <Plus className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
            title="Delete card"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="relative p-3 h-full">
      </div>
    </div>
  );
}
