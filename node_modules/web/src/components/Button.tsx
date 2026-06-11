import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

const base = "btn";

// Map our variant names to the custom CSS classes defined in custom.css
const variants: Record<Variant, string> = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  ghost: "btn--ghost",
  danger: "btn--danger",
};

// Map size props to our custom size classes
const sizes: Record<Size, string> = {
  sm: "btn--sm",
  md: "btn--md",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className,
  ...rest
}) => {
  return (
    <button {...rest} className={[base, variants[variant], sizes[size], className].filter(Boolean).join(" ")}>
      {children}
    </button>
  );
};
