import dynamic from 'next/dynamic';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/appSidebar";
import { useState, useEffect, useRef } from 'react';

function SavedPost({id, name,  image, date, openFunc, updateFunc, deleteFunc, blur}){
  //Ref containing quick action menu
  const menuRef = useRef(null)
  //Ref containing rename form card
  const formRef = useRef(null)
  //Ref  containing rename  input field value
  const updateInputRef = useRef(null)

  //List containing display values of multiple elements
  const [windowList, setWindowList] = useState({
    "quickAction": "none",
    "renameForm": "none"
  });

  //Function for changing display of set values
  function setDisplay(updates){
    //Set display of blur element to flex
    blur.current.style.display = "flex";
    //Debug
    console.log(updates)
    //Run the updates
    setWindowList(prev => {
      return {
      ...prev,
      ...updates,
      }
    })

  }

  //Effect handling clicking on  blur
  useEffect(()=>{
    //Function for serring back display of all opened modals to none
    function setBackDisplay(){
      console.log("Closing  opened modals..")
      setWindowList(prevState => {
        const  nextState =  {}
        Object.keys(prevState).forEach(key => {
          nextState[key] = "none"
        })
        return nextState
      })
    }
    //Function that  checks for clicking on blur element and sets its display to  none
    function blurClick(event){
      if (blur.current && blur.current.contains(event.target)) {
        setBackDisplay()
        console.log("Blur clicked..")
        blur.current.style.display = "none"
      }
    }
    //Add event listener to blur
    if (blur.current) {
      blur.current.addEventListener("click", blurClick)
    }
    //remove the event  listener
    return ()=>{
      if(blur.current){
        blur.current.removeEventListener("click", blurClick)
      }
    }
  },[])

  //Function for updating posts name
  function updatePostName(event){
    //Prevents function  of the  form
    event.preventDefault();
    //Get the input data
    const inputData = updateInputRef.current.value;
    //Return if inputdata is  missing
    if(!inputData){
      console.log("Missing new name");
      return;
    }
    //Use update function
    updateFunc(id, inputData)
    //Debug
    console.log("Post Updated")
  }
  // Function to show the quick action card and position it correctly
  function showQuickActionCard(event) {
    setDisplay({ quickAction: "flex" });
    const card = menuRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    card.style.top = `${rect.top - 13}px`;
    card.style.left = `${rect.right + 69}px`;
    card.style.position = "fixed";
  }
  // Function to show the rename card and position it correctly
  function showRenameForm(event){
    setDisplay({"renameForm":"flex", "quickAction":"none"})
    const card = formRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    card.style.top = `${rect.top - 12}px`;
    card.style.left = `${rect.right - rect.width - 12}px`;
    card.style.position = "fixed";
  }
  
  return(
    <>
    <div key={date} className="savedPost">
      {/*Rename post form*/}
      
        <div className="CanvasRenameCard" ref={formRef} style={{ display: windowList.renameForm }}>
          <div className="CanvasRenameFormDiv">
            <form className="CanvasRenameForm"  onSubmit={(event)  => updatePostName(event)}>
              <input type="text" className="RenameInput"  placeholder="New name..." ref={updateInputRef} />
              <input type="submit" className="RenameSubmit" value = "Rename" />
            </form>
          </div>
        </div>



      <div className="savedPostContent" >
        {/*Part of  saved post used for opening it */}
        <div className="savedPostOpenPart" onClick={() => {openFunc(image, id);  }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file size-5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
          <p>{name}</p>
        </div>

        <div className="savedPostEditPart" onClick={showQuickActionCard}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical size-5" viewBox="0 0 16 16">
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
          </svg>
{/*
          <div className="RenameCardBlur" onClick={() => toggleForm("none")}></div>
          */}
          <div className="card" ref={menuRef}  style={{ display: windowList.quickAction }}>
            <ul className="list">
              {/*Rename post button */}
              <li className="element" onClick={(e) =>{ e.stopPropagation(); showRenameForm(e);}}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7e8590"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-pencil"
                  >
                  <path
                    d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
                  ></path>
                  <path d="m15 5 4 4"></path>
                </svg>
                <p className="label">Rename</p>
              </li>
            </ul>
            <div className="separator"></div>
            <ul className="list">
              {/*Delete post button */}
              <li className="element delete"  onClick={() => deleteFunc(id)}>
                <svg
                  className="lucide lucide-trash-2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  stroke="#7e8590"
                  fill="none"
                  viewBox="0 0 24 24"
                  height="24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line y2="17" y1="11" x2="10" x1="10"></line>
                  <line y2="17" y1="11" x2="14" x1="14"></line>
                </svg>
                <p className="label">Delete</p>
              </li>
            </ul>

          </div>
        </div>


      </div>
    </div>
    </>
  )
}
export default SavedPost;