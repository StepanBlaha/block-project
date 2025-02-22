
///Not  in use




import SavedPost from "@/components/Post"
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

function SidebarPostMenu({ queryData, openSavedCanvas, updateName, deleteData, blurRef }){
    return(
        <>
        {queryData ? (
        <SidebarMenu>
            {queryData.map((data) => {
            const { _id, name, image, date } = data;
            return (
                <>
                <SidebarMenuItem key={_id}>
                    <SidebarMenuButton asChild>
                        <a  href={openSavedCanvas(image, _id)}>
                            <span>{name}</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                </>
            );
            })}
        </SidebarMenu>
        
        ) : (
        <div>No data available</div>
        )}
        </>
    )
}
export default SidebarPostMenu;