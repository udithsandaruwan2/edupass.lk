import React from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { DataProvider } from './DataContext';
import { FavoritesProvider } from './FavoritesContext';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';

/** Every app-wide provider, in dependency order (cart needs data). */
export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <ToastProvider>
      <DataProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>{children}</CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </DataProvider>
    </ToastProvider>
  </ThemeProvider>
);
