"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import Image from "next/image"
import { NavItem } from "@/config/dashboard"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-6 md:gap-8">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Logo" width={36} height={36} />
          <span className="inline-block font-bold text-lg">Sapphire</span>
        </Link>

        {/* Desktop Navigation */}
        {items?.length ? (
          <nav className="hidden gap-6 md:flex">
            {items?.map((item, index) => (
              <Link
                key={index}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors",
                  item.href.startsWith(`/${pathname.split("/")[1]}`)
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                  item.disabled && "cursor-not-allowed opacity-80"
                )}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
              >
                {item.title}
                {item.label && (
                  <span className="ml-2 rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {items?.map((item, index) => (
              <DropdownMenuItem key={index} asChild disabled={item.disabled}>
                <Link 
                  href={item.disabled ? "#" : item.href}
                  className="flex items-center w-full gap-2"
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                >
                  {item.icon && (
                    <div className="h-4 w-4">
                      {item.icon === "dashboard" && <Icons.dashboard className="h-4 w-4" />}
                      {item.icon === "document" && <Icons.document className="h-4 w-4" />}
                      {item.icon === "fingerprint" && <Icons.fingerprint className="h-4 w-4" />}
                      {item.icon === "lock" && <Icons.lock className="h-4 w-4" />}
                      {item.icon === "settings" && <Icons.settings className="h-4 w-4" />}
                      {item.icon === "upload" && <Icons.upload className="h-4 w-4" />}
                      {item.icon === "vault" && <Icons.vault className="h-4 w-4" />}
                      {item.icon === "shield" && <Icons.shield className="h-4 w-4" />}
                    </div>
                  )}
                  {item.title}
                  {item.label && (
                    <span className="ml-auto rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                      {item.label}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
