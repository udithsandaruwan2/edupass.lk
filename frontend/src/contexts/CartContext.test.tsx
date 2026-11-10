import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useCart } from './CartContext';
import { Providers } from './Providers';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <Providers>{children}</Providers>
  </MemoryRouter>
);

describe('cart', () => {
  it('adds items, merges quantities and computes the booking fee', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.add({ seminarId: 'sem-econ-system', ticketTypeId: 'sem-econ-system-std', quantity: 1 });
    });
    act(() => {
      result.current.add({ seminarId: 'sem-econ-system', ticketTypeId: 'sem-econ-system-std', quantity: 2 });
    });
    expect(result.current.count).toBe(3);
    expect(result.current.subtotal).toBe(3 * 1800);
    expect(result.current.fee).toBe(Math.round(3 * 1800 * 0.03));
    expect(result.current.total).toBe(result.current.subtotal + result.current.fee);
  });

  it('enforces the per-order ticket limit across ticket types', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.add({ seminarId: 'sem-econ-system', ticketTypeId: 'sem-econ-system-std', quantity: 5 });
    });
    let outcome!: { ok: boolean; message: string };
    act(() => {
      outcome = result.current.add({ seminarId: 'sem-econ-system', ticketTypeId: 'sem-econ-system-prm', quantity: 3 });
    });
    expect(outcome.message).toMatch(/limit/);
    expect(result.current.count).toBe(result.current.maxPerOrder);
    act(() => {
      outcome = result.current.add({ seminarId: 'sem-econ-system', ticketTypeId: 'sem-econ-system-onl', quantity: 1 });
    });
    expect(outcome.ok).toBe(false);
  });

  it('updates and removes lines, and drops items that are no longer on sale', () => {
    localStorage.setItem('edupass-demo-cart', JSON.stringify([{ seminarId: 'sem-ict-draft', ticketTypeId: 'sem-ict-draft-std', quantity: 1 }]));
    const { result } = renderHook(() => useCart(), { wrapper });
    // Draft seminars are not bookable, so the stored item is ignored
    expect(result.current.lines).toHaveLength(0);
    act(() => {
      result.current.add({ seminarId: 'sem-bs-target', ticketTypeId: 'sem-bs-target-onl', quantity: 1 });
    });
    act(() => result.current.setQuantity('sem-bs-target-onl', 4));
    expect(result.current.count).toBe(4);
    act(() => result.current.remove('sem-bs-target-onl'));
    expect(result.current.count).toBe(0);
  });
});
