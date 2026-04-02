import { Button } from "@/components/ui/button"
import { Copy, ChevronDown, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

interface CopyButtonProps {
  text: string
  onCopy: (text: string) => void
  size?: "sm" | "default"
  label?: string
}

const platforms = [
  { label: "Open in ChatGPT", url: "https://chatgpt.com/", color: "bg-green-500" },
  { label: "Open in Claude", url: "https://claude.ai/new", color: "bg-orange-500" },
  { label: "Open in Gemini", url: "https://gemini.google.com/", color: "bg-blue-500" },
] as const

export function CopyButton({ text, onCopy, size = "default", label = "Copy" }: CopyButtonProps) {
  const sizeClasses = size === "sm" ? "h-8 text-xs" : "h-9 text-sm"

  return (
    <div className="flex">
      <Button
        className={`cursor-pointer rounded-r-none border-r-0 ${sizeClasses}`}
        onClick={(e) => {
          e.stopPropagation()
          onCopy(text)
        }}
      >
        <Copy className="h-3.5 w-3.5 mr-1.5" />
        {label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className={`cursor-pointer rounded-l-none px-2 ${sizeClasses}`}
              onClick={(e) => e.stopPropagation()}
            />
          }
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {platforms.map((platform) => (
            <DropdownMenuItem
              key={platform.label}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onCopy(text)
                window.open(platform.url, "_blank")
              }}
            >
              <span className={`h-2 w-2 rounded-full ${platform.color} shrink-0`} />
              <span className="flex-1">{platform.label}</span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
