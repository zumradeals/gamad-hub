"use client";

type ActionButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  onClick?: () => void;
};

export function ActionButton({
  children,
  disabled = false,
  type = "button",
  variant = "primary",
  onClick
}: ActionButtonProps) {
  return (
    <button className={`action-button action-button-${variant}`} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
