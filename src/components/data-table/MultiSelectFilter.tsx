
import * as React from "react"
import { Check, ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MultiSelectFilterProps {
  title: string
  options: string[]
  values: string[]
  onValuesChange: (values: string[]) => void
}

export function MultiSelectFilter({
  title,
  options,
  values,
  onValuesChange,
}: MultiSelectFilterProps) {
  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onValuesChange(values.filter((v) => v !== value))
    } else {
      onValuesChange([...values, value])
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-dashed">
          <Filter className="mr-2 h-4 w-4" />
          {title}
          {values.length > 0 && (
            <>
              <div className="mx-2 h-4 w-px bg-border" />
              <div className="flex items-center">
                <span className="text-xs font-medium">{values.length}</span>
              </div>
            </>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={values.includes(option)}
            onCheckedChange={() => toggleValue(option)}
            className="capitalize"
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
