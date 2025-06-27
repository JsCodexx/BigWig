export type Role = "admin" | "surveyor" | "client";

interface NavItem {
  name: string;
  href?: string;
  children?: NavItem[];
}
export const landingSubLinks = [
  {
    name: "Carousel",
    href: "/admin/carousel",
  },

  {
    name: "Our Mission",
    href: "/admin/our-mission",
  },
  {
    name: "Our Services",
    href: "/admin/add-services",
  },
  {
    name: "We Offer",
    href: "/admin/we-offer",
  },
  {
    name: "Gallery",
    href: "/admin/add-gallery",
  },
  {
    name: "Name & Details",
    href: "/admin/add-name-type",
  },
];

export const navItems: Record<Role, NavItem[]> = {
  admin: [
    { name: "Manage Users", href: "/admin/users" },
    {
      name: "Dashboard",
      href: "/admin",
    },
    { name: "Surveys", href: "/surveyor" },
    {
      name: "Payments",
      href: "/admin/payments",
    },
    {
      name: "Landing",

      children: landingSubLinks,
    },
    {
      name: "Quotes",
      href: "/admin/quotes",
    },
    {
      name: "Billboards",
      href: "/products",
    },
    {
      name: "Satisfactory Forms",
      href: "/admin/client_comments",
    },
    // {
    //   name: "Boards",
    //   href: "/admin/bill-boards",
    // },
  ],
  surveyor: [
    {
      name: "Dashboard",
      href: "/surveyor/dashboard",
    },
    {
      name: "Submitted Surveys",
      href: "/surveyor",
    },

    {
      name: "Assigned Quotes",
      href: "/surveyor/quotes",
    },
    {
      name: "Payments",
      href: "/surveyor/payments",
    },
  ],
  client: [
    {
      name: "Dashboard",
      href: "/client",
    },
  ],
};
