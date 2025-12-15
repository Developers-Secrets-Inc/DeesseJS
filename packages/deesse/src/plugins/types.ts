import { SidebarGroup, SidebarMenu } from "./admin/types"


export type PluginConfig = {
  label: string 
  admin?: {
    sidebar: (SidebarGroup | SidebarMenu)[]
  }
}

export type Plugin = PluginConfig