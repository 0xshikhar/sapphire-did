import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Icons.logo className="h-4 w-4" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Sapphire. All rights reserved.{" "}
            <Link
              href="/terms"
              className="font-medium underline underline-offset-4"
            >
              Terms
            </Link>
            .{" "}
            <Link
              href="/privacy"
              className="font-medium underline underline-offset-4"
            >
              Privacy
            </Link>
            .
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          <Link 
            href="https://github.com/yourusername/sapphire" 
            target="_blank" 
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </Link>
        </p>
      </div>
    </footer>
  )
}
