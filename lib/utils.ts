import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Card, Position } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAbsolutePositionForCard(card: Card, cards: Record<string, Card>): Position {
  if (!card.parentId) {
    return card.position;
  }
  
  const parent = cards[card.parentId];
  if (!parent) {
    return card.position;
  }
  
  const parentAbsPos = getAbsolutePositionForCard(parent, cards);
  return {
    x: parentAbsPos.x + card.position.x,
    y: parentAbsPos.y + card.position.y,
  };
}

export function isChildOutsideParent(
  childCard: Card, 
  parentCard: Card, 
  cards: Record<string, Card>,
  buffer: number = 20
): boolean {
  if (!childCard.parentId || childCard.parentId !== parentCard.id) {
    return false;
  }

  // Get parent's absolute position
  const parentAbsPos = getAbsolutePositionForCard(parentCard, cards);
  
  // Get child's absolute position (current relative + parent absolute)
  const childAbsPos = {
    x: parentAbsPos.x + childCard.position.x,
    y: parentAbsPos.y + childCard.position.y,
  };

  // Check if child is outside parent bounds (with buffer)
  const isOutsideX = 
    childAbsPos.x < (parentAbsPos.x - buffer) || 
    childAbsPos.x > (parentAbsPos.x + parentCard.size.width + buffer);
  
  const isOutsideY = 
    childAbsPos.y < (parentAbsPos.y - buffer) || 
    childAbsPos.y > (parentAbsPos.y + parentCard.size.height + buffer);

  return isOutsideX || isOutsideY;
}
