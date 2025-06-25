import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "Sapphire",
  author: "Sapphire Team",
  description:
    "A GDPR-compliant Decentralised Identifier (DID) system for cultural heritage data management with Dataverse integration.",
  keywords: ["DID", "W3C", "Decentralized Identity", "GDPR", "Dataverse", "Cultural Heritage", "Data Management", "AI"],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "/team",
  },
  links: {
    github: "https://github.com/sapphire-project/sapphire",
    docs: "/documentation"
  },
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "About",
      href: "/about",
    },
    {
      title: "Explore",
      href: "/explore",
    },
  ],
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
}
