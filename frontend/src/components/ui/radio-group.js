import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../../utils/utils";
const RadioGroupContext = React.createContext({});
const RadioGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
    return (_jsx(RadioGroupContext.Provider, { value: { value, onValueChange }, children: _jsx("div", { className: cn("grid gap-2", className), role: "radiogroup", ref: ref, ...props, children: children }) }));
});
RadioGroup.displayName = "RadioGroup";
const RadioGroupItem = React.forwardRef(({ className, value, disabled, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext);
    const isChecked = selectedValue === value;
    return (_jsxs("button", { ref: ref, type: "button", role: "radio", "aria-checked": isChecked, disabled: disabled, className: cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className), onClick: () => onValueChange?.(value), ...props, children: [isChecked && (_jsx("div", { className: "w-2 h-2 rounded-full bg-primary mx-auto" })), children] }));
});
RadioGroupItem.displayName = "RadioGroupItem";
export { RadioGroup, RadioGroupItem };
