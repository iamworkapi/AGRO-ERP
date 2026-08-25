import { Button as PrimeButton } from "primereact/button";

const VARIANT_PROPS = {
  primary: {},
  secondary: { outlined: true, severity: "secondary" },
};

export default function Button({ children, onClick, variant = "primary", type = "button", style, disabled = false, className }) {
  return (
    <PrimeButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={className}
      {...(VARIANT_PROPS[variant] || {})}
    >
      {children}
    </PrimeButton>
  );
}
