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
