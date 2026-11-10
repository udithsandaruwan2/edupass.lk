import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { calcFee } from '../data/mock';
import { usePersistentState } from '../hooks/usePersistentState';
import type { CartItem, Seminar, TicketType } from '../types';
import { useData } from './DataContext';

export interface CartLine extends CartItem {
  seminar: Seminar;
  ticketType: TicketType;
  lineTotal: number;
  /** Seats still on sale for this ticket type */
  available: number;
}

interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  fee: number;
  total: number;
  maxPerOrder: number;
  add: (item: CartItem) => { ok: boolean; message: string };
  setQuantity: (ticketTypeId: string, quantity: number) => void;
  remove: (ticketTypeId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useData();
  const [items, setItems] = usePersistentState<CartItem[]>('edupass-demo-cart', () => []);
  const maxPerOrder = data.settings.maxTicketsPerOrder;

  // Resolve items against current data; drop anything no longer bookable
  const lines = useMemo<CartLine[]>(
    () =>
      items.flatMap((item) => {
        const seminar = data.seminars.find((s) => s.id === item.seminarId);
        const ticketType = seminar?.ticketTypes.find((t) => t.id === item.ticketTypeId);
        if (!seminar || !ticketType || seminar.status !== 'published') return [];
        return [{ ...item, seminar, ticketType, lineTotal: ticketType.price * item.quantity, available: ticketType.capacity - ticketType.sold }];
      }),
    [items, data.seminars],
  );

  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
  const fee = calcFee(subtotal, data.settings.bookingFeePercent);

  const add = useCallback(
    (item: CartItem) => {
      const existing = items.find((i) => i.ticketTypeId === item.ticketTypeId)?.quantity ?? 0;
      const others = items.filter((i) => i.ticketTypeId !== item.ticketTypeId).reduce((n, i) => n + i.quantity, 0);
      const quantity = Math.min(existing + item.quantity, maxPerOrder - others);
      if (quantity <= existing) return { ok: false, message: `You can book up to ${maxPerOrder} tickets per order.` };
      setItems((prev) => [...prev.filter((i) => i.ticketTypeId !== item.ticketTypeId), { ...item, quantity }]);
      return { ok: true, message: quantity < existing + item.quantity ? `Added up to the ${maxPerOrder}-ticket limit.` : 'Added to cart.' };
    },
    [items, maxPerOrder, setItems],
  );

  const setQuantity = useCallback(
    (ticketTypeId: string, quantity: number) =>
      setItems((prev) => prev.map((i) => (i.ticketTypeId === ticketTypeId ? { ...i, quantity: Math.max(1, quantity) } : i))),
    [setItems],
  );
  const remove = useCallback((ticketTypeId: string) => setItems((prev) => prev.filter((i) => i.ticketTypeId !== ticketTypeId)), [setItems]);
  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(
    () => ({ items, lines, count, subtotal, fee, total: subtotal + fee, maxPerOrder, add, setQuantity, remove, clear }),
    [items, lines, count, subtotal, fee, maxPerOrder, add, setQuantity, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
