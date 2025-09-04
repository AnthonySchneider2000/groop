'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CanvasState, CardAction, Position } from '@/lib/types';

const initialState: CanvasState = {
  cards: {},
  selectedCardId: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

function cardsReducer(state: CanvasState, action: CardAction): CanvasState {
  switch (action.type) {
    case 'ADD_CARD': {
      const { parentId, position = { x: 100, y: 100 } } = action.payload;
      const newCard: Card = {
        id: uuidv4(),
        title: 'New Card',
        position,
        size: { width: 200, height: 120 },
        parentId: parentId || null,
        childIds: [],
        zIndex: Object.keys(state.cards).length + 1,
        isEditing: true,
      };

      const updatedCards = { ...state.cards, [newCard.id]: newCard };

      // If adding to a parent, update parent's childIds
      if (parentId && state.cards[parentId]) {
        updatedCards[parentId] = {
          ...state.cards[parentId],
          childIds: [...state.cards[parentId].childIds, newCard.id],
        };
      }

      return {
        ...state,
        cards: updatedCards,
        selectedCardId: newCard.id,
      };
    }

    case 'DELETE_CARD': {
      const { cardId } = action.payload;
      const card = state.cards[cardId];
      if (!card) return state;

      const updatedCards = { ...state.cards };
      
      // Remove from parent's childIds
      if (card.parentId && updatedCards[card.parentId]) {
        updatedCards[card.parentId] = {
          ...updatedCards[card.parentId],
          childIds: updatedCards[card.parentId].childIds.filter(id => id !== cardId),
        };
      }

      // Recursively delete all children
      const deleteRecursively = (id: string) => {
        const cardToDelete = updatedCards[id];
        if (cardToDelete) {
          cardToDelete.childIds.forEach(deleteRecursively);
          delete updatedCards[id];
        }
      };

      deleteRecursively(cardId);

      return {
        ...state,
        cards: updatedCards,
        selectedCardId: state.selectedCardId === cardId ? null : state.selectedCardId,
      };
    }

    case 'UPDATE_CARD': {
      const { cardId, updates } = action.payload;
      if (!state.cards[cardId]) return state;

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...state.cards[cardId], ...updates },
        },
      };
    }

    case 'MOVE_CARD': {
      const { cardId, position } = action.payload;
      const card = state.cards[cardId];
      if (!card) return state;

      const updatedCards = { ...state.cards };
      
      // Only update the position of the root card being moved
      // Children positions are relative to their parent, so they don't need updating
      updatedCards[cardId] = {
        ...card,
        position,
      };

      return {
        ...state,
        cards: updatedCards,
      };
    }

    case 'SET_PARENT': {
      const { cardId, parentId } = action.payload;
      const card = state.cards[cardId];
      if (!card || cardId === parentId) return state;

      const updatedCards = { ...state.cards };

      // Remove from old parent
      if (card.parentId && updatedCards[card.parentId]) {
        updatedCards[card.parentId] = {
          ...updatedCards[card.parentId],
          childIds: updatedCards[card.parentId].childIds.filter(id => id !== cardId),
        };
      }

      // Add to new parent
      if (parentId && updatedCards[parentId]) {
        updatedCards[parentId] = {
          ...updatedCards[parentId],
          childIds: [...updatedCards[parentId].childIds, cardId],
        };
      }

      updatedCards[cardId] = {
        ...card,
        parentId,
      };

      return {
        ...state,
        cards: updatedCards,
      };
    }

    case 'SELECT_CARD':
      return {
        ...state,
        selectedCardId: action.payload.cardId,
      };

    case 'START_EDITING':
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.payload.cardId]: {
            ...state.cards[action.payload.cardId],
            isEditing: true,
          },
        },
      };

    case 'STOP_EDITING':
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.payload.cardId]: {
            ...state.cards[action.payload.cardId],
            isEditing: false,
          },
        },
      };

    case 'RESET_ZOOM':
      return {
        ...state,
        zoom: 1,
        pan: { x: 0, y: 0 },
      };

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: action.payload.zoom,
      };

    case 'SET_PAN':
      return {
        ...state,
        pan: action.payload.pan,
      };

    default:
      return state;
  }
}

interface CardsContextType {
  state: CanvasState;
  dispatch: React.Dispatch<CardAction>;
  addCard: (parentId?: string, position?: Position) => void;
  deleteCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  moveCard: (cardId: string, position: Position) => void;
  selectCard: (cardId: string | null) => void;
  startEditing: (cardId: string) => void;
  stopEditing: (cardId: string) => void;
}

const CardsContext = createContext<CardsContextType | undefined>(undefined);

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cardsReducer, initialState);

  const addCard = useCallback((parentId?: string, position?: Position) => {
    dispatch({ type: 'ADD_CARD', payload: { parentId, position } });
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    dispatch({ type: 'DELETE_CARD', payload: { cardId } });
  }, []);

  const updateCard = useCallback((cardId: string, updates: Partial<Card>) => {
    dispatch({ type: 'UPDATE_CARD', payload: { cardId, updates } });
  }, []);

  const moveCard = useCallback((cardId: string, position: Position) => {
    dispatch({ type: 'MOVE_CARD', payload: { cardId, position } });
  }, []);

  const selectCard = useCallback((cardId: string | null) => {
    dispatch({ type: 'SELECT_CARD', payload: { cardId } });
  }, []);

  const startEditing = useCallback((cardId: string) => {
    dispatch({ type: 'START_EDITING', payload: { cardId } });
  }, []);

  const stopEditing = useCallback((cardId: string) => {
    dispatch({ type: 'STOP_EDITING', payload: { cardId } });
  }, []);

  const value: CardsContextType = {
    state,
    dispatch,
    addCard,
    deleteCard,
    updateCard,
    moveCard,
    selectCard,
    startEditing,
    stopEditing,
  };

  return (
    <CardsContext.Provider value={value}>
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const context = useContext(CardsContext);
  if (context === undefined) {
    throw new Error('useCards must be used within a CardsProvider');
  }
  return context;
}
