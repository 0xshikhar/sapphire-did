export interface NavItem {
  title: string
  href: string
  icon?: string
  disabled?: boolean
  external?: boolean
  label?: string
}

interface DashboardConfig {
  mainNav: NavItem[]
  sidebarNav: NavItem[]
}

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Explore",
      href: "/explore",
    },
    {
      title: "About",
      href: "/about",
    },
  ],
  sidebarNav: [
    {
      title: "Overview",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      title: "Data Vault",
      href: "/dashboard/data-vault",
      icon: "vault",
    },
    {
      title: "Upload Dataset",
      href: "/dashboard/upload",
      icon: "upload",
    },
    {
      title: "My DIDs",
      href: "/dashboard/dids",
      icon: "fingerprint",
    },
    {
      title: "Permissions",
      href: "/dashboard/permissions",
      icon: "lock",
    },
    {
      title: "GDPR Consent",
      href: "/dashboard/consent",
      icon: "shield",
    },
    {
      title: "Profile Settings",
      href: "/dashboard/settings",
      icon: "settings",
    },
  ],
}
