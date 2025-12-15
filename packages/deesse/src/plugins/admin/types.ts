export type SidebarGroup = {
  label: string;
  collapsible: boolean;
  children: SidebarMenu[];
};

export type SidebarMenu = {
  children: (SidebarSubmenu | Page)[];
};

export type SidebarSubmenu = {
  children: Page[]
};

export type Page = {
  label: string;
  href: string;
  icon: React.ReactNode
  content: React.ReactNode
};
