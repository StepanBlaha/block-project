"use client"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import SavedPostList from "@/components/PostList"
import SidebarPostMenu from "@/components/SidebarPostList"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
  } from "@/components/ui/sidebar"

const items = [
    {
      title: "Home",
      url: "/home",
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
export default function AppSidebar({queryData, openSavedCanvas, updateName, deleteData, blurRef,  handleSidebar}) {
    return(
        <Sidebar className='Sidebar'>
              <SidebarTrigger onClick={handleSidebar} className="SidebarButton"/>
            <SidebarContent className="SidebarContent">
              {/*Aplications */}
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
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
                <SidebarSeparator />
              {/*Saved Posts */}
                <SidebarGroup>
                    <SidebarGroupLabel>Posts</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        <SavedPostList
                          queryData={queryData}
                          openSavedCanvas={openSavedCanvas}
                          updateName={updateName}
                          deleteData={deleteData}
                          blurRef={blurRef}
                        />             
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
                
    )
}