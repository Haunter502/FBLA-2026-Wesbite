"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === RadioGroupItem) {
            const childElement = child as React.ReactElement<{ value: string; checked?: boolean; onCheckedChange?: (checked: boolean) => void }>
            const childValue = (childElement.props as { value: string }).value
            return React.cloneElement(childElement, {
              checked: childValue === value,
              onCheckedChange: () => onValueChange?.(childValue),
            })
          }
          return child
        })}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  checked?: boolean
  onCheckedChange?: () => void
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, checked, onCheckedChange, id, ...props }, ref) => {
    const inputId = id || `radio-${value}`
    return (
      <input
        ref={ref}
        type="radio"
        id={inputId}
        value={value}
        checked={checked}
        onChange={onCheckedChange}
        className={cn(
          "h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }

