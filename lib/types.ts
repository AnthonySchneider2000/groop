export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Card {
  id: string;
  title: string;
  position: Position;
  size: Size;
  parentId: string | null;
  childIds: string[];
  zIndex: number;
  isEditing?: boolean;
}

export interface CanvasState {
  cards: Record<string, Card>;
  selectedCardId: string | null;
  zoom: number;
  pan: Position;
}

export type CardAction = 
  | { type: 'ADD_CARD'; payload: { parentId?: string; position?: Position } }
  | { type: 'DELETE_CARD'; payload: { cardId: string } }
  | { type: 'UPDATE_CARD'; payload: { cardId: string; updates: Partial<Card> } }
  | { type: 'MOVE_CARD'; payload: { cardId: string; position: Position } }
  | { type: 'SET_PARENT'; payload: { cardId: string; parentId: string | null } }
  | { type: 'SELECT_CARD'; payload: { cardId: string | null } }
  | { type: 'START_EDITING'; payload: { cardId: string } }
  | { type: 'STOP_EDITING'; payload: { cardId: string } }
  | { type: 'RESET_ZOOM' }
  | { type: 'SET_ZOOM'; payload: { zoom: number } }
  | { type: 'SET_PAN'; payload: { pan: Position } };
