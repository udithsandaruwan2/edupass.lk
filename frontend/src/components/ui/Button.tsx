import React from 'react';
import { Link } from 'react-router';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonClasses';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };
type ButtonAsRoute = CommonProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string; href?: undefined };
type ButtonAsLink = CommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined };

/** Renders a router link (`to`), external/anchor link (`href`) or a button. */
export const Button: React.FC<ButtonAsButton | ButtonAsRoute | ButtonAsLink> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) => {
  const classes = buttonClasses(variant, size, className);
  if (typeof rest.to === 'string') {
    const { to, ...anchor } = rest as ButtonAsRoute;
    return (
      <Link to={to} className={classes} {...anchor}>
        {children}
      </Link>
    );
  }
  if (typeof rest.href === 'string') {
    return (
      <a className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'ghost' | 'secondary' | 'overlay';
  children: React.ReactNode;
}

const iconVariants = {
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  secondary: 'text-fg bg-surface border border-line hover:bg-surface-2',
  overlay: 'text-white bg-black/55 hover:bg-black/75 backdrop-blur-sm',
};

/** Square icon-only button. `label` is required and becomes the accessible name and tooltip. */
export const IconButton: React.FC<IconButtonProps> = ({
  label,
  variant = 'ghost',
  className = '',
  children,
  ...rest
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 ${iconVariants[variant]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
