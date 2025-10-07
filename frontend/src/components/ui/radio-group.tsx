import * as React from "react"
import { cn } from "../../lib/utils"

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface RadioGroupItemProps {
  value: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange }}>
        <div
          className={cn("grid gap-2", className)}
          role="radiogroup"
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext);
    const isChecked = selectedValue === value;

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isChecked}
        disabled={disabled}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => onValueChange?.(value)}
        {...props}
      >
        {isChecked && (
          <div className="w-2 h-2 rounded-full bg-primary mx-auto" />
        )}
        {children}
      </button>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }