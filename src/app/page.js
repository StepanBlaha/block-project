"use client";

import * as THREE from 'three';
import { render } from "react-dom";
import "./../styles/canvas.css";
import { useEffect, useState, useRef, use } from 'react'
import React from 'react';
import { document } from "postcss";
import { notFound } from "next/navigation";
import { set } from "mongoose";
import { off, send } from "process";
import { get, map } from "jquery";
import * as fabric from 'fabric';
import CanvasInputComponent from '../components/CanvasInputComponent';
import SaveMenu from "../components/SaveMenu";
import { jsPDF } from "jspdf";




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
  return(
    <>
    <div key={date} className="savedPost">
      {/*Rename post form*/}
      <div className="RenameCardDiv" ref={formRef} style={{ display: windowList.renameForm }}>
        <div className="RenameCardBlur" onClick={() => setDisplay({"quickAction":"none"})}></div>
        <div className="CanvasRenameCard">
          <div className="CanvasRenameFormDiv">
            <form className="CanvasRenameForm"  onSubmit={(event)  => updatePostName(event)}>
              <input type="text" className="RenameInput"  placeholder="New name..." ref={updateInputRef} />
              <input type="submit" className="RenameSubmit" value = "Rename" />
            </form>
          </div>
        </div>
      </div>


      <div className="savedPostContent" >
        {/*Part of  saved post used for opening it */}
        <div className="savedPostOpenPart" onClick={() => {openFunc(image, id);  }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark size-5" viewBox="0 0 16 16">
            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
          </svg>
          <p>{name}</p>
        </div>

        <div className="savedPostEditPart" onClick={() => setDisplay({"quickAction":"flex"})}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical size-5" viewBox="0 0 16 16">
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
          </svg>
{/*
          <div className="RenameCardBlur" onClick={() => toggleForm("none")}></div>
          */}
          <div className="card" ref={menuRef}  style={{ display: windowList.quickAction }}>
            <ul className="list">
              {/*Rename post button */}
              <li className="element" onClick={(e) =>{ e.stopPropagation(); setDisplay({"renameForm":"flex", "quickAction":"none"});}}>
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





const Home = () => {

  /*
  perlin noise brush attempt
  const textureCanvasref = useRef(null)
  useEffect(()=>{
    const loader =  new THREE.TextureLoader()
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    const buffer = textureCanvasref.current
    buffer.width = canvas.width
    buffer.height = canvas.height
    const bufferctx = buffer.getContext("2d")

    loader.load("texture.png", (texture)=>{
      const img = new Image
      img.src = texture.image.src;

      img.onload= () =>{
        let offsetX = 0
        let offsetY = 0

        canvas.addEventListener("mousedown", (event)=>{
          offsetX, offsetY  = getMousePos(event)
          setDrawing(true)
        })

        canvas.addEventListener("mousemove", (event)=>{
          console.log(img)
          if (!isDrawing) return;
          const {newX, newY} = getMousePos(event)

        
          
          const dx = newX - offsetX
          const dy = newY - offsetY
          const dist = Math.sqrt(dx * dx + dy * dy)
          const stepSize = 5
          for (let index = 0; index < dist; index+= stepSize) {
            stepX= offsetX + ( dx * ( index / dist ))
            stepY= offsetY + ( dy * ( index / dist ))
            bufferctx.drawImage(img, stepX - 15, stepY - 15, 30, 30);

          }
          offsetX = newX
          offsetY = newY

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(buffer, 0, 0);

          canvasRef.current = canvas
          ctxRef.current = ctx

          

        })
        


      }
    })
  },[])

  */


  //Reference for link to save canvas as png
  const pngSaveRef = useRef(null)

  //State containing currently selected tool
  const [selectedTool, setSelectedTool] = useState("brush")

  //Reference for the save&export menu
  const actionMenuRef = useRef(null)
  //Reference for the image input
  const imageMenuRef = useRef(null)

  //Mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  //State for checking if user is currently drawing with brush tool
  const [isDrawing, setDrawing] = useState(false)
  //State for checking if user is currently erasing with eraser
  const [isErasing, setErasing] = useState(false)
  //State containing current brush size
  const [brushSize, setBrushSize] = useState(4);
  
  //Reference for object for changing brush size
  const brushSizeRef = useRef(null)
  //Reference for object for changing color
  const brushColorRef = useRef(null)
  //Reference for current brush color
  const brushColor = useRef("#ffffff")

  //Reference for the context element
  const ctxRef = useRef(null)
  //Reference for the main canvas element
  const canvasRef = useRef(null)
  //Reference for the div containing main canvas element
  const canvasDivRef = useRef(null)

  const hiddenImgRef = useRef(null)

  const [queryData, setQueryData] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [sending, setSending] = useState(false);

  //State for checking if image is updatable
  const [updatableImg, setUpdatableImg] = useState(false);
  //State for containing the id of updatable image
  const [updateId, setUpdateId] = useState(null);

  //Reference containing the starting point of a drawn shape
  const shapeStartPoint = useRef(null);
  //Reference containing the ending point of a drawn shape
  const shapeEndPoint = useRef(null);
  //Reference for checking wether the shape should be filled or not 
  const fillCheckRef = useRef(null)

  //State containing wether the textbox should be shown or not
  const [showTextbox, setShowTextbox] = useState(false);
  //State for containing textbox position
  const [textboxPos, setTextboxPos] = useState({ x: 0, y: 0 });
  //State for containing position of written text
  const [textboxTextPos, setTextboxTextPos] = useState({ x: 0, y: 0 });
  //Reference for textbox object
  const textboxRef = useRef(null);
  //Reference for checking if user is typing
  const isTyping = useRef(false);
  //References canvas save name menu
  const saveMenuRef = useRef(null)
  const saveMenuInputRef = useRef(null)
   //Ref for checking if user is making a shape
   const isMakingShape = useRef(false)
   //Ref for the shape preview canvas
   const preShapeCanvas = useRef(null)
  //Reference for blur opened displayed when modal is opened
  const blurRef = useRef(null)

  //setup throttle for image move function
  const imgMoveThrottle = throttle(mouseImgMoveHandle, 200)
  //Throttling function for limiting how many times a given function runs
  function throttle(mainFunc, delay){
    let isThrottle = false
    return (...args) => {
      if(!isThrottle){
        mainFunc(...args);
        isThrottle = setTimeout(() => {
          isThrottle = false
        }, delay)
      }
    }
  }

  //Initial canvas setup
  useEffect(()=>{
    //Debug
    console.log("Page loaded")
    //Get the parent element height and width
    const height = canvasDivRef.current.clientHeight
    const width = canvasDivRef.current.clientWidth
    //Update the canvas html height and width
    canvasRef.current.height = height
    canvasRef.current.width = width
    //Canvas setup func
    canvasSetup()
    //Asign event listener for resizing to window
    if (typeof window !== "undefined") {
      //Add the event listener
      window.addEventListener("resize", resizeCanvas);
      //Call resize initially
      resizeCanvas();
      //Remove the event listener to avoid having multiple of them at the same time
      return () => window.removeEventListener("resize", resizeCanvas);
    }
  },[])
  //Function for default canvas setup
  function canvasSetup(){
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = brushColor.current;
    ctx.lineWidth = brushSize;
    ctxRef.current = ctx
    canvasRef.current = canvas
  }

   //Function for handling window resize
   function resizeCanvas(){
    //Get the parent height 
    const height = canvasDivRef.current.clientHeight
    const width = canvasDivRef.current.clientWidth
    //Get the canvas and save its content
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");
    const tempImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //Resize the canvas
    canvasRef.current.height = height
    canvasRef.current.width = width
    //Restore saved content
    ctx.putImageData(tempImage, 0, 0);
    canvasRef.current = canvas
    ctxRef.current =  ctx
    //Perform initial canvas setup again
    canvasSetup()
  }

  //Function for detecting when user is typing
  function detectTyping(event) {
    //Get mouse pos
    const { offsetX, offsetY } = getMousePos(event);
    const boxOffsetX = (event.clientX );
    const boxOffsetY = (event.clientY );
    //Set position of text box
    setTextboxPos({ x: boxOffsetX, y: boxOffsetY });
    //Set position of written text
    setTextboxTextPos({ x: offsetX, y: offsetY });
    //Debug
    console.log(offsetX, offsetY)
    //Set textbox visible
    setShowTextbox(!showTextbox);
    
    if (!showTextbox) {
      isTyping.current = true;
      const textbox = textboxRef.current;
      textbox.style.display = "block";
      setTimeout(() => {
        textbox.focus();
      }, 0);
      
    } else {
      const textbox = textboxRef.current;
      const text = textbox.value;
      handleBlur(text);
    }
    
  }
  
  function handleBlur(val) {
    if (isTyping.current) { 
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d");
      ctx.font = brushSizeRef.current.value*10 + "px Arial";
      ctx.fillStyle = brushColor.current
      ctx.fillText(val, textboxTextPos.x, textboxTextPos.y);
      isTyping.current = false;
      const textbox = textboxRef.current;
      textbox.style.display = "none";
      textbox.value = "";

    }else{
      console.log("not typing")
    }
  }





  //Dictionary that calls the correct function based on the selected tool
  const canvasClickActions = {
    "brush": mouseDownHandle,
    "bucket": bucketFillCanvas,
    "eraser": mouseEraserDownHandle,
    "text": detectTyping,
    "rectangle": shapeDownHandle,
    "circle": shapeDownHandle,
    "triangle": shapeDownHandle,
    "diamond": shapeDownHandle,
    "pentagon": shapeDownHandle,
    "hexagon": shapeDownHandle,
    "4star": shapeDownHandle,
    "5star": shapeDownHandle,
    "horizontalArrow": shapeDownHandle,
    "verticalArrow": shapeDownHandle,
    "line": shapeDownHandle,
    "image": handleImgMouseDown
  }
  //Dictionary that calls the correct function based on the selected tool
  const canvasMouseMoveActions = {
    "brush": mouseMoveHandle,
    "bucket": null,
    "eraser": mouseEraserMoveHandle,
    "text": null,
    "rectangle":  shapeMoveHandle,
    "circle": shapeMoveHandle,
    "triangle": shapeMoveHandle,
    "diamond": shapeMoveHandle,
    "pentagon": shapeMoveHandle,
    "hexagon": shapeMoveHandle,
    "4star": shapeMoveHandle,
    "5star": shapeMoveHandle,
    "horizontalArrow": shapeMoveHandle,
    "verticalArrow": shapeMoveHandle,
    "line": shapeMoveHandle,
    "image": imgMoveThrottle
  }
  //Dictionary that calls the correct function based on the selected tool
  const canvasMouseUpActions = {
    "brush": mouseUpHandle,
    "bucket": null,
    "eraser": mouseEraserUpHandle,
    "text": null,
    "rectangle": shapeUpHandle,
    "circle": shapeUpHandle,
    "triangle": shapeUpHandle,
    "diamond": shapeUpHandle,
    "pentagon": shapeUpHandle,
    "hexagon": shapeUpHandle,
    "4star": shapeUpHandle,
    "5star": shapeUpHandle,
    "horizontalArrow": shapeUpHandle,
    "verticalArrow": shapeUpHandle,
    "line": shapeUpHandle,
    "image": mouseImgUpHandle
  }
  //Dictionary that sets the correct cursor icon based on the selected tool
  const cursors = {
    "brush": "url('/paint-brush.png') 0 16, auto",
    "bucket": "url('/bucket.png'), auto",
    "eraser": "url('/eraser.png') 0 16, auto",
    "text": "text",
    "rectangle": "auto",
    "circle": "auto",
    "triangle": "auto",
    "diamond": "auto",
    "pentagon": "auto",
    "hexagon": "auto",
    "4star": "auto",
    "5star": "auto",
    "horizontalArrow": "auto",
    "verticalArrow": "auto",
    "line": "auto",
    "image": "auto"
  }

  //Function for setting the cursor icon based on the selected tool 
  function setCursorIcon() {
    const canvas = canvasDivRef.current
    canvas.style.cursor = cursors[selectedTool]
    canvasDivRef.current = canvas
  }
  //Triggers setCursor function upon selectedTool getting changed
  useEffect(() => {
    setCursorIcon()
  },[selectedTool])

  //Function for filling the canvas with the selected color using bucket tool
  function bucketFillCanvas() {
    //Gets the canvas element
    const canvas = canvasRef.current
    //Gets the context element
    const ctx = ctxRef.current
    //Sets the context mode to drawing
    ctx.globalCompositeOperation="source-over";
    //Sets the fill color to current brush color
    ctx.fillStyle = brushColor.current
    //Fills the canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    //Sets current context to changed context
    ctxRef.current = ctx
  }
  //Function for drawing shape on given canvas context
  function createShape(ctx) {
    //Gets the fillcheck value
    const fillCheck = fillCheckRef.current
    //Sets the context mode to drawing
    ctx.globalCompositeOperation="source-over";
    //Sets the start and end points
    const { x: startX, y: startY } = shapeStartPoint.current;
    const { x: endX, y: endY } = shapeEndPoint.current;
    //Begins drawing
    ctx.beginPath()
    //Handles different shape tools
    switch (selectedTool) {
      case "rectangle":
        ctx.rect(startX, startY, (endX - startX), (endY - startY))
        break;
      case "circle":
        const radius = Math.abs(Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2));
        ctx.arc(startX, startY, radius, 0, Math.PI * 2)
        break;
      case "line":
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        break;
      case "triangle":
        ctx.moveTo(endX, endY)
        ctx.lineTo(startX, endY)
        ctx.lineTo((endX - startX) / 2 + startX, startY)
        ctx.closePath(); 
        break
      case "diamond":
        //Upper corner
        ctx.moveTo((endX - startX) / 2 + startX, startY)
        //Right corner
        ctx.lineTo(endX, (endY - startY) / 2 + startY)
        //Lower corner
        ctx.lineTo((endX - startX) / 2 + startX, endY)
        //Left corner
        ctx.lineTo(startX, (endY - startY) / 2 + startY)
        //End
        ctx.closePath(); 
        break
      case "horizontalArrow":
        //Arrow tip right
        ctx.moveTo(endX, (endY - startY) / 2 + startY)
        //Arrow tip bottom
        ctx.lineTo((endX - startX) / 2 + startX, endY)
        //Line from bottom tip
        ctx.lineTo((endX - startX) / 2 + startX, ((endY - startY) / 4)* 3+ startY)
        //Bottom straight line
        ctx.lineTo(startX, ((endY - startY) / 4) * 3+ startY)
        //side
        ctx.lineTo(startX, ((endY - startY) / 4)  + startY)
        //Upper straight line
        ctx.lineTo((endX - startX) / 2 + startX, ((endY - startY) / 4)  + startY)
        //Line to upper tip
        ctx.lineTo((endX - startX) / 2 + startX, startY)
        //end
        ctx.closePath(); 
        break
      case "verticalArrow":
        //Arrow tip upper 
        ctx.moveTo((endX - startX) / 2 + startX, startY)
        //Arrow tip right
        ctx.lineTo(endX, (endY - startY) / 2 + startY)
        //Line from right tip
        ctx.lineTo(((endX - startX) / 4)* 3+ startX, (endY - startY) / 2 + startY)
        //Right straight line
        ctx.lineTo(((endX - startX) / 4)* 3+ startX, endY)
        //side
        ctx.lineTo(((endX - startX) / 4)+ startX, endY)
        //Left straight line
        ctx.lineTo(((endX - startX) / 4)+ startX, (endY - startY) / 2 + startY)
        //Line to left tip
        ctx.lineTo(startX, (endY - startY) / 2 + startY)
        //end
        ctx.closePath(); 
        break
      case "pentagon":
        //Tip upper
        ctx.moveTo((endX - startX) / 2 + startX, startY)
        //Tip right
        ctx.lineTo(endX, ((endY - startY) / 5) * 2 + startY)
        //Tip bottom right
        ctx.lineTo(((endX - startX) / 5) * 4 + startX, endY)
        //Tip bottom left
        ctx.lineTo(((endX - startX) / 5) + startX, endY)
        //Tip left
        ctx.lineTo(startX, ((endY - startY) / 5) * 2 + startY)
        //End
        ctx.closePath(); 
        break
      case "hexagon":
        //Tip upper
        ctx.moveTo((endX - startX) / 2 + startX, startY)
        //Tip right upper
        ctx.lineTo(endX, ((endY - startY) / 4)  + startY)
        //Tip right lower
        ctx.lineTo(endX, ((endY - startY) / 4)  * 3 + startY)
        //Tip Bottom
        ctx.lineTo((endX - startX) / 2 + startX, endY)
        //Tip left lower
        ctx.lineTo(startX, ((endY - startY) / 4)  * 3 + startY)
        //Tip left upper
        ctx.lineTo(startX, ((endY - startY) / 4) + startY)
        //End
        ctx.closePath(); 
        break
      case "4star":
        //Tip upper
        ctx.moveTo((endX - startX) / 2 + startX, startY)
        //Inside corner upper right
        ctx.lineTo(((endX - startX) / 5)  * 3 + startX, ((endY - startY) / 5)  * 2 + startY)
        //Tip right
        ctx.lineTo(endX, (endY - startY) / 2 + startY)
        //Inside corner lower right
        ctx.lineTo(((endX - startX) / 5)  * 3 + startX, ((endY - startY) / 5)  * 3+ startY)
        //Tip lower
        ctx.lineTo((endX - startX) / 2 + startX, endY)
        //Inside corner lower left
        ctx.lineTo(((endX - startX) / 5)  * 2 + startX, ((endY - startY) / 5)  * 3+ startY)
        //Tip left
        ctx.lineTo(startX, (endY - startY) / 2 + startY)
        //Inside corner upper left
        ctx.lineTo(((endX - startX) / 5)  * 2 + startX, ((endY - startY) / 5)  * 2+ startY)
        //End
        ctx.closePath(); 
        break
      case "5star":
        //Tip upper
        ctx.moveTo((endX - startX) / 2 + startX, startY)
        //Inside corner upper right
        ctx.lineTo(((endX - startX) / 5)  * 3 + startX, ((endY - startY) / 5)  * 2 + startY)
        //Right upper tip
        ctx.lineTo(endX, ((endY - startY) / 5)  * 2 + startY)
        //Inside corner lower right
        ctx.lineTo(((endX - startX) / 3)  * 2 + startX, ((endY - startY) / 5)  * 3 + startY)
        //Right lower tip
        ctx.lineTo(((endX - startX) / 5)  * 4 + startX, endY)
        //Inside corner lower 
        ctx.lineTo(((endX - startX) / 2)  + startX, ((endY - startY) / 7)  * 5 + startY)
        //Left lower tip
        ctx.lineTo(((endX - startX) / 5) + startX, endY)
        //Inside corner lower left
        ctx.lineTo(((endX - startX) / 3)   + startX, ((endY - startY) / 5)  * 3 + startY)
        //Left upper tip
        ctx.lineTo(startX, ((endY - startY) / 5)  * 2 + startY)
        //Inside corner upper left
        ctx.lineTo(((endX - startX) / 5)  * 2 + startX, ((endY - startY) / 5)  * 2 + startY)
        //End
        ctx.closePath(); 
        break
    }
    //If the fillcheck  = true fills the shape
    if (fillCheck.checked) {
      ctx.fillStyle = brushColor.current
      ctx.fill()
    }
    //Set the brush width and color
    ctx.lineWidth = brushSize
    ctx.strokeStyle = brushColor.current;
    //Does the stroke
    ctx.stroke()
  }
  //Function for the mouse down while  holding the shape tool
  function shapeDownHandle(event) {
    //Gets the mouse position
    const {offsetX, offsetY} = getMousePos(event)
    //Sets the shape start point to current mouse position
    shapeStartPoint.current = { x: offsetX, y: offsetY };
    //set width and height for preshape ref
    preShapeCanvas.current.width = canvasRef.current.width
    preShapeCanvas.current.height = canvasRef.current.height
    //Sets the ismakingshape to true
    isMakingShape.current = true
  }
  //Function for handling moving mouse while holding the shape tool
  //While moving continuously erases and draws the shape
  function shapeMoveHandle(event){
    if(isMakingShape.current){
      //Gets the mouse position
      const {offsetX, offsetY} = getMousePos(event)
      //Set the shape endpoint
      shapeEndPoint.current = { x: offsetX, y: offsetY };
      //Get the preshapecanvas and its ref
      const previewCanvas = preShapeCanvas.current;
      const ctx = previewCanvas.getContext("2d");
      //Clear the preview canvas
      //Clearing this ctx doesnt mean we cleared the preShapeCanvas.current ctx
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      //draw the shape
      createShape(ctx); 
    }
  }
  //Function for handling mouseup when holding any shape tool
  function shapeUpHandle(event) {
    //Gets the mouse position
    const {offsetX, offsetY} = getMousePos(event)
    //Sets the shape end point to current mouse position
    shapeEndPoint.current = { x: offsetX, y: offsetY };
    //Get the canvas  and context
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    //Calls the function to create the shape
    createShape(ctx); 
    //Clear the preview canvas
    const previewCanvas = preShapeCanvas.current;
    previewCanvas.getContext("2d").clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    //Set ismakingshape to false
    isMakingShape.current = false;
  }


  //Function for handling mousedown while having eraser selected
  function mouseEraserDownHandle(event){
    //Sets erasing to true
    setErasing(true)
    //Gets the mouse position
    const {offsetX, offsetY} = getMousePos(event)
    //Gets the context element
    const ctx = ctxRef.current
    //Starts erasing
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY)
  }
  //Function for handling mousemove while having eraser selected
  function mouseEraserMoveHandle(event){
    //Gets the mouse position
    const {offsetX, offsetY} = getMousePos(event)
    //Sets the mouse position
    setMousePos({ x: offsetX, y: offsetY });
    //Checks if  user is erasing
    if(isErasing){
      //Gets the context element
      const ctx = ctxRef.current
      //Sets the context mode to erasing
      ctx.globalCompositeOperation="destination-out";
      //Erases line to the position of maouse
      ctx.lineTo(offsetX, offsetY);
      //Does the erase stroke
      ctx.stroke()
    }
  }
  //Function for handling mouseup while having eraser selected
  function mouseEraserUpHandle(){
    //Sets erasing to false
    setErasing(false)
  }

  //Function for fetching data from database on reload
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data from the server");
        // Fetch data from the server
        const res = await fetch("http://localhost:3000/api/posts", { cache: "no-store" });
        // Check if the response is ok
        if (!res.ok) {
          console.error("Failed to fetch data from the server");
          return;
        }
        // Parse the response body as JSON
        const data = await res.json();
        // Set the data to the state
        setQueryData(data);
      } catch (error) {//Catch any errors
        console.error("Error fetching data:", error);
      } finally {//Finally set the loading state to false
        setLoading(false); 
      }
    };
    
    fetchData();
  }, [sending]);

  //Function for updating data in database
  const updateData = async (updateId) => {
    try{
      // Set the sending state to true
      setSending(true);
      //Get the api url
      const apiUrl = `http://localhost:3000/api/posts/${updateId}`;
      // Get the canvas and convert it to a data URL
      const canvas = canvasRef.current
      const canvasUrl = canvas.toDataURL()
      const canvasData = {
        newImage: canvasUrl
      }
      // Send the data to the server
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(canvasData),
      })
      // Check if the response is ok
      if (response.ok) {
        const data = await response.json();  
        console.log('Post updated successfully:', data);
      } else {
        console.error('Failed to update post:', response.statusText);
      }


    }catch(error){//Catch any errors
      console.error("Error updating data:", error);
    }finally{//Finally set the sending state to false
      setSending(false);    
    }
  };
  //Function for updating records name
  const updateName = async (updateId, updateName) => {
    try{
      // Set the sending state to true
      setSending(true);
      //Get the api url
      const apiUrl = `http://localhost:3000/api/posts/${updateId}`;
      // Get the new canvas name
      const canvasData = {
        newName: updateName,
      }
      // Send the data to the server
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(canvasData),
      })
      // Check if the response is ok
      if (response.ok) {
        const data = await response.json();  
        console.log('Post updated successfully:', data);
      } else {
        console.error('Failed to update post:', response.statusText);
      }



    }catch(error){//Catch any errors
      console.error("Error updating data:", error);
    }finally{//Finally set the sending state to false
      setSending(false);    
    }
  }
  //Function for deleting records from database
  const deleteData = async (deleteId) => {
    try{
      // Set the sending state to true
      setSending(true);
      //Get the api url
      const apiUrl = `http://localhost:3000/api/posts/${deleteId}`;
      //Send data to server
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }
      })

      // Check if the response is ok
      if (response.ok) {
        const data = await response.json();  
        console.log('Post deleted successfully:', data);
      } else {
        console.error('Failed to delete post:', response.statusText);
      }
 
    }catch(error){//Catch any errors
      console.error("Error updating data:", error);
    }finally{//Finally set the sending state to false
      setSending(false);    
    }
  }

//For sending data to database
  const sendData = async (canvasName) => {
    try {
      // Set the sending state to true
      setSending(true);
      // Get the canvas and convert it to a data URL
      const canvas = canvasRef.current
      const canvasUrl = canvas.toDataURL()
      const canvasData = {
        name: canvasName,
        image: canvasUrl, 
        date: Date.now()
      }
      // Send the data to the server
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(canvasData ),
      })
      // Check if the response is ok
      if (response.ok) {
        const data = await response.json();  
        console.log('Post created successfully:', data);
        console.log(canvasData)
      } else {
        console.error('Failed to create post:', response.statusText);
      }
    }catch (error) {//Catch any errors
      console.error("Error sending data:", error);
    }finally {//Finally set the sending state to false
      setSending(false);
    }
  } 

 //Function for saving current canvas under user inputed name
  function saveCanvas(event) {
    //Prevent function of the form
    event.preventDefault();
    //Get the user input
    const userInput = saveMenuInputRef.current.value
    //Stop the function if the string is empty
    if (!userInput) {
      return
    }
    sendData(userInput)
  }
  //Function for saving canvas as png
  function saveCanvasAsPng(){
    //Get the canvas object
    const canvas = canvasRef.current
    //Turns it to DataURL element 
    const canvasUrl = canvas.toDataURL("image/png")
    //Get the download link
    const downloadLink = pngSaveRef.current
    //Sets the attributes for downloading
    downloadLink.setAttribute("download", "Barcode.png");
    downloadLink.setAttribute("href", canvasUrl);
  }

  //Function for saving canvas as pdf
  function saveCanvasAsPdf(){
    //Get the canvas object
    const canvas = canvasRef.current
    //Turns it to DataURL element 
    const canvasUrl = canvas.toDataURL("image/png")
    //Initialize pdf object
    const doc = new jsPDF();
    //Get the scale
    const scalingOffset = (doc.internal.pageSize.width / canvas.width)
    //Scale the width of the saved canvas
    const width = canvas.width * scalingOffset
    //Scale the height of the saved canvas
    const height  = canvas.height  *scalingOffset
    //Add the canvas image to the pdf
    doc.addImage(canvasUrl, "PNG", 0, 10, width, height)
    //Save the pdf
    doc.save("canvas.pdf")
  }

  //Function for getting mouse position
  function getMousePos(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect(); 
    const scaleX = canvas.width / rect.width; 
    const scaleY = canvas.height / rect.height; 
    const offsetX = (event.clientX - rect.left) * scaleX;
    const offsetY = (event.clientY - rect.top) * scaleY;
    return {offsetX, offsetY}
  }

  //Function for handling when user presses down on mouse while on the canvas
  function mouseDownHandle(event){
    const {offsetX, offsetY} = getMousePos(event)
    setDrawing(true)
    const ctx = ctxRef.current
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY)
  }

  //Function for handling mouse movement
  function mouseMoveHandle(event){
    const {offsetX, offsetY} = getMousePos(event)
    setMousePos({ x: offsetX, y: offsetY });
    if (isDrawing) {
      const ctx = ctxRef.current
      ctx.globalCompositeOperation="source-over";
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke()
    }
  }

  //Function for stopping drawing when the user lets go of the mouse button
  function mouseUpHandle(){
    setDrawing(false)
  }

  //Function for clearing the canvas
  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctxRef.current = ctx
    
  }

  //Function for changing brush color
  function changeBrushColor() {
    brushColor.current = brushColorRef.current.value
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = brushColor.current;
    ctxRef.current = ctx
  }

  //Function for changing brush size
  function changeBrushSize(){
    setBrushSize(brushSizeRef.current.value)
  }

  //Detects the change in brush size and updates the canvas brush size settings
  useEffect(() => { 
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = brushSize
    ctxRef.current = ctx
  }, [brushSize])

  //Function for opening saved canvas
  function openSavedCanvas(imageSrc, id){
    //Set the canvas to be updatable
    setUpdatableImg(true)
    //Set the update id
    setUpdateId(id) 
    //Get the canvas and context
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");
    //Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    //Draw the image on the canvas
    const img = hiddenImgRef.current;
    img.onload = () => {ctx.drawImage(img , 0, 0)}
    img.src = imageSrc
    //Set the context and canvas to the refs
    hiddenImgRef.current = img
    canvasRef.current = canvas
    ctxRef.current = ctx
  }



  const userImgFormRef = useRef(null)
  const userImgRef = useRef(null)
  const isDraggable = useRef(false)
  const imagePosition  = useRef({x: 0,y: 0})
  const preImageCanvas = useRef(null)
  const preImageCtx = useRef(null)

  const canvasBeforeMoveRef = useRef(null)


  const imageSources = useRef([])
  const imagePositions = useRef([])
  const currentClickedImage = useRef(null)
  const currentClickedImageIndex = useRef(null)



  
  function handleUserImg(e){
    //Prevent function of the form
    e.preventDefault();
    //Get the user input link
    const inputData = userImgFormRef.current.value
    //Stop the function if the string is empty
    if (!inputData) {
      return
    }
    //const imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQwAAAC8CAMAAAC672BgAAAAe1BMVEX///8iIiIAAAAbGxsfHx9zc3NOTk4NDQ0mJiYWFhbBwcHy8vITExOZmZkYGBj7+/vh4eGysrLKysq4uLiJiYlfX1/19fXZ2dm/v79JSUk4ODgICAgtLS13d3fs7OydnZ1CQkLT09NsbGypqalXV1eHh4d/f39MTEySkpKQgEmkAAADEUlEQVR4nO3Zi3KiMACFYRJiA4pcFNCKtVZd6/s/4SYoblBrd2e2OKX/N9OpCZEJR3IRPQ8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHyej0YjKdztPbbdJhts2Gq8761Lnt7nkRaCnl0pZmA1lbZlcN0zwyByrzJ8Z9zSOXsa+UECo0hYOMlC0IJQeX7SqtRKyljoWqovEjuvr18jAIAnP5oiq9QupquVDSxiFf3FardSVEHBWv2WuhfZPVU/moDn+lcjUale++ufo0lzJPy2SV1TeHnDmNglAIvTtOJbO1KUTrx3S3A08mjHCs47djcaZNGKEzUHaRKe+aUrIwzfXL5Un6woYhfDlsyr/Mxatl0hS30hTF6Nw8tWHJSced7EodRnz+6L03c/VCnxdY3wyb6tVpvzdh+esOO9ilOgzno05sGPI0aLzM3hihu5zOKvd4z9gw1NJZIOwUeh41RWzug+fWGwJzPMq762CXbBhx4VQEThjljSuv81l31r9O2TCivVPhhnEcE+0t6VjbKbWfG1Ebhj44FW4YE3m9dmR1QB98hfnm6jDcLbYbxlRez5bHupnXR3fDyG5c+PxGQH3xF3dGO4wfe2fcnDNsXfUD54zj5nvaekO9mgQ9Xk0+CiNZfrDPaO/DeuNuGN4mvNphmU1Gey3ukfth1JOGdmfL4zRynjJWaeL1x/0wvMXlBtWOkvipKe2VvvHM9Nv6JIzhxXrS3oYNpBJK9ieNT8LwXszuW6lmoLxV9mgzo65sMuY7b1d9/UrlaDRK7DPQ6JCYl/YHFMOGUU3rY3WrnU1DHuzDrlVuHxjLTXOC+kGQqXjUBfxPufTrnwrMxfp+rEpv61b4p9s/sWNBaP1ePGu7xZB/ZpA+3Rm5jKIorEWRDm0YTYX5H8ntqV0WyFgJE49QsVzOnTPs6zljeuvk3812M3Al3rxVsTlPHElWhPWvbWGRtVfSPJTLXmTxT8p0Mpzc2FOUoz7tMwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgD34D5JwhFLaKceAAAAAASUVORK5CYII=";
    const imageSrc = inputData
    //Create image and set its source
    const img = new Image();
    img.src = imageSrc;
    
    img.onload = () => {
      console.log("Image fully loaded, adding to list");

      // Get references to sources and positions
      const imageSrcList = imageSources.current;
      const imagePosList = imagePositions.current;

      // Store the image source and initial position
      imageSrcList.push(imageSrc);
      imagePosList.push({ x: 0, y: 0 });

      // Update the refs
      imageSources.current = imageSrcList;
      imagePositions.current = imagePosList;

      // Draw the image after it has loaded
      drawImage(0, 0, imageSrc);
    };
  }

  //Function for geting the dimensions of loaded img
  function getImageSize(imageSrc) {
    return new Promise((resolve, reject) => {
      //Create a new image object
      const img = new Image();
      //Get the source for the new image
      const imgSrc = imageSrc
      //Set the source for the image
      img.src = imgSrc

      //Upon loading get img size
      img.onload = () => {
        //Get image dimensions
        const imgWidth = img.width;
        const imgHeight = img.height;
        //Debug
        //console.log(`width: ${imgWidth}`);
        //console.log(`height: ${imgHeight}`);
        // Resolve with dimensions
        resolve({ imgWidth, imgHeight });
      };
  
    });
  }

  //Function for drawing the image on the canvas
  function  drawImage(x, y, imageSrc){
    return new Promise((resolve, reject) => {
      // Get the canvas and context
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      //Create a new image object
      const img = new Image();
      //Get the source for the new image
      const imgSrc = imageSrc
      //Debug
      console.log(imgSrc)
      //Set the source for the image
      img.src = imgSrc

      img.onload = () => {
        //Debug
        console.log("Image loaded");
        //Draw the image
        ctx.drawImage(img, x, y);
        //Debug
        console.log("Image Drawn");
        //Get the image width and height
        const imgWidth = img.width;
        const imgHeight = img.height;
        //Debug
        console.log(`width: ${imgWidth}`);
        console.log(`height: ${imgHeight}`);
  
        //Resolve with dimensions
        resolve({ imgWidth, imgHeight });
      };
      //Update canvas and context refs
      canvasRef.current = canvas
      ctxRef.current = ctx
  

    });
  }


  //Function for handling clicking with image tool selected
  async function handleImgMouseDown(event){
    //Gets canvas and context refs
    preImageCanvas.current = canvasRef.current
    preImageCtx.current = ctxRef.current
    //Gets mouse position
    const {offsetX, offsetY} = getMousePos(event)
    //Get the list of image sources
    const imageSrcList = imageSources.current
    //Get the list of image positions
    const imagePosList = imagePositions.current

    console.log("Checking click at:", offsetX, offsetY);
    console.log("Stored images:", imageSrcList);
    console.log("Stored positions:", imagePosList);

    for (let index = 0; index < imageSrcList.length; index++) {
      let imgSrc = imageSrcList[index]
      //Gets the image position
      let { x, y } = imagePosList[index];
      //Gets the image size
      let {imgWidth, imgHeight} = await getImageSize(imgSrc)

      //Checks for clicking on image
      console.log("--------------------------------")
      console.log(`Index ${index}`)
      console.log(`Dimension x: ${x}`)
      console.log(`Dimension y: ${y}`)
      console.log(`Width ${ imgWidth}`)
      console.log(`Height ${ imgHeight}`)
      console.log(`Source ${imgSrc}`)

      if(
        offsetX >=  imagePosList[index].x && offsetX <= imagePosList[index].x + imgWidth &&
        offsetY >=  imagePosList[index].y && offsetY <=  imagePosList[index].y + imgHeight
      ){
        //Debug
        console.log("image  clicked");
        //Sets draggable to true
        isDraggable.current = true;
        //Sets the src for current draggable img
        currentClickedImage.current = imgSrc
        //Sets the index of current draggable img
        currentClickedImageIndex.current = index
        //Breaks out of the loop
        break;
      }
      
    }

  }

//Function for saving the old canvas before moving an  image
function saveCanvasBeforeMove(){
  //Get the canvas and turn it to dataUrl
  const canvas = canvasRef.current
  const imageSrc = canvas.toDataURL()
  //Update the save ref
  canvasBeforeMoveRef.current  = imageSrc
  }
  


//Function for reseting the canvas upon moving
function resetCanvas(){
  //Get the canvas and context
  const canvas = canvasRef.current
  const ctx = canvas.getContext("2d");
  //Get the old canvas
  const imageSrc = canvasBeforeMoveRef.current
  //Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  //Draw the old saved canvas 
  const img = hiddenImgRef.current;
  img.onload = () => {ctx.drawImage(img , 0, 0)}
  img.src = imageSrc
  //Update the  refs
  hiddenImgRef.current = img
  canvasRef.current = canvas
  ctxRef.current = ctx
}
  //Function for handling mouse move while holding the image tool
  function mouseImgMoveHandle(event){
    if(isDraggable.current){
      const imagePosList = imagePositions.current
      setTimeout(()=>{
        resetCanvas()
        let {offsetX, offsetY} = getMousePos(event)
        imagePosList[currentClickedImageIndex.current] = {x: offsetX,y: offsetY}
        imagePositions.current = imagePosList
        redrawAll()
      },400)

    }
  }
  //Function for handling mouse up event while holding the img tool
  function mouseImgUpHandle(event) {
    //Get the mouse position
    const { offsetX, offsetY } = getMousePos(event)
    //Get the image position list
    const imagePosList = imagePositions.current
    //Set the position of last dragged image to current mouse position
    imagePosList[currentClickedImageIndex.current] = {x: offsetX,y: offsetY}
    //Clear the working variables
    imagePositions.current = imagePosList
    isDraggable.current = false
    currentClickedImage.current = null
    currentClickedImageIndex.current = null

  }

  function clearAllImages(){
    //get the canvas and context
    const canvas = canvasRef.current;
    const ctx = ctxRef.current
    //Get the position and source list
    const srcList = imageSources.current
    const posList = imagePositions.current
    //Draw all the images
    for (let index = 0; index < srcList.length; index++) {
      //Gets the image position
      let { x, y } = posList[index];
      //Create a new image object
      const img = new Image();
      //Get the source for the new image
      const imgSrc = srcList[index]
      //Set the source for the image
      img.src = imgSrc

      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;
        ctx.clearRect(x,y, imgWidth, imgHeight)
      }
      //Update canvas and context refs
      
      
    }
    canvasRef.current = canvas
    ctxRef.current = ctx
  }

  //Function for drawing all images
  function redrawAll(){
    //get the canvas and context
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    //Get the position and source list
    const srcList = imageSources.current
    const posList = imagePositions.current
    //Draw all the images
    for (let index = 0; index < srcList.length; index++) {
      //Gets the image position
      let { x, y } = posList[index];
      //Create a new image object
      const img = new Image();
      //Get the source for the new image
      const imgSrc = srcList[index]
      //Set the source for the image
      img.src = imgSrc

      img.onload = () => {
        //Draw the image
        ctx.drawImage(img, x, y);
      }
      //Update canvas and context refs
      canvasRef.current = canvas
      ctxRef.current = ctx
    }
  }
  



  //Function for setting display value of given menu
  function toggleMenu(value, refItem){
    const menu = refItem.current
    menu.style.display = value
  }




  return (
    <>
      
      <div className="Main">
        <div className="AllPostBlur" ref={blurRef} onClick={() => console.log("skibidi")}></div>

        {/*Menu for setting name for the saved canvas */} 
        <div className="SaveCardDiv" ref={saveMenuRef}>
          <div  className="CanvasSaveNameCardBlur" onClick={() => toggleMenu("none", saveMenuRef)}></div>            
          <div className="CanvasSaveNameCard" >
            <div className="CanvasSaveNameCardForm">
              <form className="SaveNameForm" onSubmit={saveCanvas}>
                <input type="text"  className="SaveNameInput" placeholder="Save name..." ref={saveMenuInputRef}/>
                <input type="submit" className="SavePostSubmit" value="Save"/>
              </form>
            </div>
          </div>
        </div>
        

        <div className="Menu">
          <div className="ActionMenu">
            
            <div className="ActionTool" id="SaveMenuButton" onMouseOver={() => toggleMenu("flex", actionMenuRef)} onMouseOut={() => toggleMenu("none", actionMenuRef)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-floppy size-10" viewBox="0 0 16 16" >
                <path d="M11 2H9v3h2z"/>
                <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
              </svg>

              <div className="ActionSaveMenu" ref={actionMenuRef} >

                  <div className="ActionSaveItem"  onClick={() => {toggleMenu("flex", saveMenuRef);  toggleMenu("flex", actionMenuRef);}}>

                    <div className="ActionSaveItemIcon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download size-6" viewBox="0 0 16 16">
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                      </svg>
                    </div>

                    <div className="ActionSaveItemText" >
                      <p>Save</p>
                    </div>
                  </div>
                  
                  {updatableImg && 
                  <>
                  <div className="ActionSaveItem" onClick={() => updateData(updateId)}>

                    <div className="ActionSaveItemIcon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-floppy size-6" viewBox="0 0 16 16">
                        <path d="M11 2H9v3h2z"/>
                        <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
                      </svg>
                    </div>

                    <div className="ActionSaveItemText">
                      <p>Update</p>
                    </div>

                  </div>
                  </>
                  }


                  <a ref={pngSaveRef}>
                    <div className="ActionSaveItem"  onClick={saveCanvasAsPng}>

                      <div className="ActionSaveItemIcon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-filetype-png size-6" viewBox="0 0 16 16">
                          <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zm-3.76 8.132q.114.23.14.492h-.776a.8.8 0 0 0-.097-.249.7.7 0 0 0-.17-.19.7.7 0 0 0-.237-.126 1 1 0 0 0-.299-.044q-.427 0-.665.302-.234.301-.234.85v.498q0 .351.097.615a.9.9 0 0 0 .304.413.87.87 0 0 0 .519.146 1 1 0 0 0 .457-.096.67.67 0 0 0 .272-.264q.09-.164.091-.363v-.255H8.82v-.59h1.576v.798q0 .29-.097.55a1.3 1.3 0 0 1-.293.458 1.4 1.4 0 0 1-.495.313q-.296.111-.697.111a2 2 0 0 1-.753-.132 1.45 1.45 0 0 1-.533-.377 1.6 1.6 0 0 1-.32-.58 2.5 2.5 0 0 1-.105-.745v-.506q0-.543.2-.95.201-.406.582-.633.384-.228.926-.228.357 0 .636.1.281.1.48.275.2.176.314.407Zm-8.64-.706H0v4h.791v-1.343h.803q.43 0 .732-.172.305-.177.463-.475a1.4 1.4 0 0 0 .161-.677q0-.374-.158-.677a1.2 1.2 0 0 0-.46-.477q-.3-.18-.732-.179m.545 1.333a.8.8 0 0 1-.085.381.57.57 0 0 1-.238.24.8.8 0 0 1-.375.082H.788v-1.406h.66q.327 0 .512.182.185.181.185.521m1.964 2.666V13.25h.032l1.761 2.675h.656v-3.999h-.75v2.66h-.032l-1.752-2.66h-.662v4z"/>
                        </svg>
                      </div>

                      <div className="ActionSaveItemText">
                        <p>Export as Png</p>
                      </div>

                    </div>
                  </a>

                  <div className="ActionSaveItem" onClick={saveCanvasAsPdf}>

                    <div className="ActionSaveItemIcon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-filetype-pdf size-6" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.6 11.85H0v3.999h.791v-1.342h.803q.43 0 .732-.173.305-.175.463-.474a1.4 1.4 0 0 0 .161-.677q0-.375-.158-.677a1.2 1.2 0 0 0-.46-.477q-.3-.18-.732-.179m.545 1.333a.8.8 0 0 1-.085.38.57.57 0 0 1-.238.241.8.8 0 0 1-.375.082H.788V12.48h.66q.327 0 .512.181.185.183.185.522m1.217-1.333v3.999h1.46q.602 0 .998-.237a1.45 1.45 0 0 0 .595-.689q.196-.45.196-1.084 0-.63-.196-1.075a1.43 1.43 0 0 0-.589-.68q-.396-.234-1.005-.234zm.791.645h.563q.371 0 .609.152a.9.9 0 0 1 .354.454q.118.302.118.753a2.3 2.3 0 0 1-.068.592 1.1 1.1 0 0 1-.196.422.8.8 0 0 1-.334.252 1.3 1.3 0 0 1-.483.082h-.563zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638z"/>
                      </svg>
                    </div>
                    
                    <div className="ActionSaveItemText">
                      <p>Export as Pdf</p>
                    </div>

                  </div>

              </div>

              
            </div>

            
            <div className="ActionTool">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash size-10" viewBox="0 0 16 16" onClick={clearCanvas}>
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
              </svg>
            </div>
          </div>

          {/*Menu with tools*/}
          <div className="ToolMenu">
            {/*Image Tool*/}
            <div className="Tool" id="ImageInputButton" onMouseOver =  {() => toggleMenu("flex", imageMenuRef)} onMouseOut={() => toggleMenu("none", imageMenuRef)} >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-image size-10" viewBox="0 0 16 16" onClick={() => setSelectedTool("image")}>
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
              </svg>
                <div className="ImageInputCard" ref={imageMenuRef}>

                  <div className="InputCardSection">
                    <p className="InputCardTitle">Insert Image link</p>
                  </div>
                  <div className="InputCardSection" id="FormCardSection">
                    <form className="ImageInputForm" onSubmit={handleUserImg}>
                      {/*<input type="file" accept=".png, .jpeg, .jpg, image/png, image/jpeg" className="ImageInput" ref={userImgFormRef}/>*/}
                      <input type="text" className="ImageLinkInput" placeholder="https://..." ref={userImgFormRef}/>
                      <input type="submit" id="ImageInputSubmit" onClick={() => setSelectedTool("image")}/>
                    </form>
                  </div>
                </div>

            </div>
            {/*Brush Tool*/}
            <div className="Tool">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10"  onClick={() => setSelectedTool("brush")}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
              </svg>
            </div>
            {/*Bucket Tool*/}
            <div className="Tool">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-paint-bucket size-10" viewBox="0 0 16 16" onClick={() => setSelectedTool("bucket")}>
                <path d="M6.192 2.78c-.458-.677-.927-1.248-1.35-1.643a3 3 0 0 0-.71-.515c-.217-.104-.56-.205-.882-.02-.367.213-.427.63-.43.896-.003.304.064.664.173 1.044.196.687.556 1.528 1.035 2.402L.752 8.22c-.277.277-.269.656-.218.918.055.283.187.593.36.903.348.627.92 1.361 1.626 2.068.707.707 1.441 1.278 2.068 1.626.31.173.62.305.903.36.262.05.64.059.918-.218l5.615-5.615c.118.257.092.512.05.939-.03.292-.068.665-.073 1.176v.123h.003a1 1 0 0 0 1.993 0H14v-.057a1 1 0 0 0-.004-.117c-.055-1.25-.7-2.738-1.86-3.494a4 4 0 0 0-.211-.434c-.349-.626-.92-1.36-1.627-2.067S8.857 3.052 8.23 2.704c-.31-.172-.62-.304-.903-.36-.262-.05-.64-.058-.918.219zM4.16 1.867c.381.356.844.922 1.311 1.632l-.704.705c-.382-.727-.66-1.402-.813-1.938a3.3 3.3 0 0 1-.131-.673q.137.09.337.274m.394 3.965c.54.852 1.107 1.567 1.607 2.033a.5.5 0 1 0 .682-.732c-.453-.422-1.017-1.136-1.564-2.027l1.088-1.088q.081.181.183.365c.349.627.92 1.361 1.627 2.068.706.707 1.44 1.278 2.068 1.626q.183.103.365.183l-4.861 4.862-.068-.01c-.137-.027-.342-.104-.608-.252-.524-.292-1.186-.8-1.846-1.46s-1.168-1.32-1.46-1.846c-.147-.265-.225-.47-.251-.607l-.01-.068zm2.87-1.935a2.4 2.4 0 0 1-.241-.561c.135.033.324.11.562.241.524.292 1.186.8 1.846 1.46.45.45.83.901 1.118 1.31a3.5 3.5 0 0 0-1.066.091 11 11 0 0 1-.76-.694c-.66-.66-1.167-1.322-1.458-1.847z"/>
              </svg>
            </div>
            {/*Eraser Tool*/}
            <div className="Tool">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eraser size-10" viewBox="0 0 16 16" onClick={() => setSelectedTool("eraser")}>
                <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/>
              </svg>
            </div>
            {/*Text Tool*/}
            <div className="Tool">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-fonts size-10" viewBox="0 0 16 16" onClick={() => setSelectedTool("text")}>
                <path d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479z"/>
              </svg>
            </div>
            {/*Shape Tool*/}
            <div className="Tool">
              <ul id="ShapeSelect">
                <li id="ShapeSelectHover">
                  {/*The shape tool icon */}
                  <a>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-square size-8" viewBox="0 0 16 16" onClick={() => setSelectedTool("rectangle")}>
                      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  </a>
                  {/*Ther shape menu */}
                  <ul className="ShapeSelectList">
                    {/*Square */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("rectangle")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-square size-8" viewBox="0 0 16 16" >
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                      </svg>
                    </li>
                    {/*Circle */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("circle")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle size-8" viewBox="0 0 16 16" >
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                      </svg>
                    </li>
                    {/*Triangle */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("triangle")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-triangle size-8" viewBox="0 0 16 16" >
                        <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                      </svg>
                    </li>
                    {/*Diamond */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("diamond")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-diamond size-8" viewBox="0 0 16 16" >
                        <path d="M6.95.435c.58-.58 1.52-.58 2.1 0l6.515 6.516c.58.58.58 1.519 0 2.098L9.05 15.565c-.58.58-1.519.58-2.098 0L.435 9.05a1.48 1.48 0 0 1 0-2.098zm1.4.7a.495.495 0 0 0-.7 0L1.134 7.65a.495.495 0 0 0 0 .7l6.516 6.516a.495.495 0 0 0 .7 0l6.516-6.516a.495.495 0 0 0 0-.7L8.35 1.134z"/>
                      </svg>
                    </li>
                    {/*Pentagon */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("pentagon")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pentagon size-8" viewBox="0 0 16 16" >
                        <path d="M7.685 1.545a.5.5 0 0 1 .63 0l6.263 5.088a.5.5 0 0 1 .161.539l-2.362 7.479a.5.5 0 0 1-.476.349H4.099a.5.5 0 0 1-.476-.35L1.26 7.173a.5.5 0 0 1 .161-.54l6.263-5.087Zm8.213 5.28a.5.5 0 0 0-.162-.54L8.316.257a.5.5 0 0 0-.631 0L.264 6.286a.5.5 0 0 0-.162.538l2.788 8.827a.5.5 0 0 0 .476.349h9.268a.5.5 0 0 0 .476-.35l2.788-8.826Z"/>
                      </svg>
                    </li>
                    {/*Hexagon */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("hexagon")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hexagon size-8" viewBox="0 0 16 16" >
                        <path d="M14 4.577v6.846L8 15l-6-3.577V4.577L8 1zM8.5.134a1 1 0 0 0-1 0l-6 3.577a1 1 0 0 0-.5.866v6.846a1 1 0 0 0 .5.866l6 3.577a1 1 0 0 0 1 0l6-3.577a1 1 0 0 0 .5-.866V4.577a1 1 0 0 0-.5-.866z"/>
                      </svg>
                    </li>
                     {/*4 pointed star -----musim predelat ikonku---*/}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("4star")}>
                      <i className="fi fi-tr-sparkles size-8 starIcon"></i>

                    </li>
                    {/*5 pointed star */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("5star")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-star size-8" viewBox="0 0 16 16" >
                        <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
                      </svg>
                    </li>
                    {/*Horizontal arrow*/}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("horizontalArrow")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right size-8" viewBox="0 0 16 16" >
                        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                      </svg>
                    </li>
                    {/*Vertical arrow*/}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("verticalArrow")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up size-8" viewBox="0 0 16 16" >
                        <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
                      </svg>
                    </li>

                    {/*Line */}
                    <li className="ShapeSelectItem" id="BottomShape" onClick={() => setSelectedTool("line")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-slash size-8" viewBox="0 0 16 16" >
                        <path d="M11.354 4.646a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708l6-6a.5.5 0 0 1 .708 0"/>
                      </svg>
                    </li>

                  </ul>

                </li>
              </ul>
            </div>
            {/*Fill Tool*/}
            <div className="Tool" id="FillTool">
              <p className="FillTitle">Fill</p>
              <label class="checkBox"> 
                <input id="ch1" type="checkbox"ref={fillCheckRef}/>
                <div class="transition"></div>
              </label>
            </div>
            {/*Brush Color*/}
            <div className="Tool" id="BrushColorTool">
              <form id="brushColorForm">
                <input type="color" name="brushColor" id="brushColor" value={brushColor.current}  onChange={changeBrushColor}  ref={brushColorRef}/>
              </form>
            </div>
            {/*Brush Size*/}
            <div className="Tool">
              <form id="brushSizeForm">
                <input type="range" name="brushSize" id="brushSize"  min="1" max="50"  value={brushSize} step="1" onChange={changeBrushSize}  ref={brushSizeRef}/>
              </form>
            </div>
          </div>
        </div>

        <div className="Sidebar">
          <div className="SettingsMenu">

           {/*Display loading message while loading*/}
            {loading && <div>Loading...</div>}

            {/*Displays fetch data once loaded*/}
            {queryData && (
              <div className="savedPostTable">
                {queryData.map((data) => {
                  const { _id, name, image, date } = data;
                  return (
                    <>
                    <SavedPost   id={_id} name={name} image={image} date={date} openFunc={openSavedCanvas} updateFunc={updateName} deleteFunc={deleteData} key={date}  blur={blurRef}/>
                    </>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="Content">

          <div className="ContentTitle">
            
          </div>

          <div className="ContentCanvas" ref={canvasDivRef}
            onMouseMove={canvasMouseMoveActions[selectedTool]} 
            onMouseDown={selectedTool === "text" ? detectTyping : canvasClickActions[selectedTool]}
            onMouseUp={canvasMouseUpActions[selectedTool]}
          >
            <canvas id="myCanvas" width="400" height="200" ref={canvasRef}></canvas>
            <canvas className='shapeCanvas' ref={preShapeCanvas}></canvas>

            
            

          </div>
            {selectedTool === "text" && (
              <textarea ref={textboxRef} style={{
                position: "fixed",
                top: textboxPos.y ,
                left: textboxPos.x,
                color: brushColor.current,
                border: "none",
                background: "none",
                fontSize:  "20px",
              }}
                placeholder="Enter text here..."
                className="textbox"></textarea>
            )}

        </div>
        {/* 
        <canvas ref={textureCanvasref} style={{display:"none"}}></canvas>
*/}
      </div>
      <img className="hiddenImg" ref={hiddenImgRef}></img>
      
    </>
  );
}
export default Home;