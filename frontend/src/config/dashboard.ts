export interface NavItem {
  title: string
  href?: string
  icon?: string
  disabled?: boolean
  external?: boolean
  label?: string
  items?: NavItem[]
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
      title: "Identity",
      icon: "fingerprint",
      items: [
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
      ],
    },
    {
      title: "Data Management",
      icon: "vault",
      items: [
        {
          title: "Data Vault",
          href: "/dashboard/data-vault",
          icon: "vault",
        },
        {
          title: "Upload",
          href: "/dashboard/upload",
          icon: "upload",
        },
      ],
    },
    {
      title: "Dataverse",
      icon: "database",
      items: [
        {
          title: "Browse Datasets",
          href: "/dashboard/dataverse",
          icon: "search",
        },
        {
          title: "Dataset Details",
          href: "/dashboard/dataverse/dataset",
          icon: "document",
        },
        {
          title: "Upload Dataset",
          href: "/dashboard/dataverse/upload",
          icon: "upload",
        },
        {
          title: "Link Dataset",
          href: "/dashboard/dataverse/link",
          icon: "link",
        },
      ],
    },
    {
      title: "AI Tools",
      icon: "sparkles",
      items: [
        {
          title: "Auto-Tag",
          href: "/dashboard/dataverse/auto-tag",
          icon: "sparkles",
        },
        {
          title: "Enhance Metadata",
          href: "/dashboard/dataverse/enhance",
          icon: "sparkles",
        },
      ],
    },
    {
      title: "Sharing",
      icon: "share2",
      items: [
        {
          title: "Share Dataset",
          href: "/dashboard/dataverse/share",
          icon: "share2",
        },
        {
          title: "Sharing Settings",
          href: "/dashboard/dataverse/sharing",
          icon: "share2",
        },
      ],
    },
    {
      title: "Settings",
      icon: "settings",
      items: [
        {
          title: "Profile Settings",
          href: "/dashboard/settings",
          icon: "settings",
        },
        {
          title: "GDPR Settings",
          href: "/dashboard/settings/gdpr",
          icon: "shield",
        },
      ],
    },
  ],
}
