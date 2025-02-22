"use client"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import SavedPostList from "@/components/PostList"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"

const items = [
    {
      title: "Home",
      url: "#",
      icon: Home,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ]
export default function AppSidebar({queryData, openSavedCanvas, updateName, deleteData, blurRef}) {
    return(
        <Sidebar>
            <SidebarContent >
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        <SavedPostList
                          queryData={queryData}
                          openSavedCanvas={openSavedCanvas}
                          updateName={updateName}
                          deleteData={deleteData}
                          blurRef={blurRef}
                        />
                            {items.map((item)=>(
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a  href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
                
    )
}