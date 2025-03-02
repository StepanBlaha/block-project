"use client";


import "./../../styles/canvas.css";
import { useEffect, useState, useRef, use } from 'react'
import React from 'react';
import { jsPDF } from "jspdf";
import dynamic from 'next/dynamic';
import AppSidebar from "@/components/appSidebar"
import SavedPostList from "@/components/PostList"









const Home = () => {
    useEffect(()=>{

    },[])
  //Reference for canvas state stack
  const stateStack = useRef([])
  //Reference for current state index
  const currentStateIndex = useRef(0)

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
  //ref for containing position of written text
  const textboxTextPos = useRef({ x: 0, y: 0 })
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
      window.addEventListener("keydown", handleHotkeyActions);
      //Call resize initially
      resizeCanvas();
      //Remove the event listener to avoid having multiple of them at the same time
      return () => {
        window.removeEventListener("resize", resizeCanvas);
        window.removeEventListener("keydown", handleHotkeyActions);
      }
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

  //Function for saving current canvas state to the stack
  function saveToStack() {
    //Get  the canvas and ctx
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");
    if (currentStateIndex.current == stateStack.current.length - 1) {
      //Push current state to the state list
      stateStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      //Increase the current state index if the stack length is more than 1
      if(stateStack.current.length != 1){
        currentStateIndex.current = currentStateIndex.current + 1
      }
    }else{
      //Remove all states after the current state
      const newStack = stateStack.current.slice(0, currentStateIndex.current + 1);
      stateStack.current = newStack
      //Push the current state to the stack
      stateStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
      //Increase the current state index if the stack length is more than 1
      if(stateStack.current.length != 1){
        currentStateIndex.current = currentStateIndex.current + 1
      }
    }
  }

  // Function for handling hotkey actions upon pressing button
  function handleHotkeyActions(event){
    //Run function according to pressed hotkey
    switch(event.key.toLowerCase()){
      case "z":
        if(event.ctrlKey){
          event.preventDefault(); 
          stepBack()
        }
        break;
      case "y":
        if(event.ctrlKey){
          event.preventDefault(); 
          stepForward()
        }
        break;
      
      case "x":
        if(event.ctrlKey){
          event.preventDefault(); 
          clearCanvas()
        }
        break;

      case "b":
        if(event.shiftKey){
          event.preventDefault(); 
          setSelectedTool("brush")
        }
        break;

      case "f":
        if(event.shiftKey){
          event.preventDefault(); 
          setSelectedTool("bucket")
        }
        if(event.ctrlKey){
          event.preventDefault(); 
          fillCheckRef.current.click()
        }
        break;

      case "e":
        if(event.shiftKey){
          event.preventDefault(); 
          setSelectedTool("eraser")
        }
        break;

      case "t":
        event.preventDefault(); 
        if(event.shiftKey){
          setSelectedTool("text")
        }
        break;

      case "p":
        if(event.shiftKey){
          event.preventDefault(); 
          setSelectedTool("pipet")
        }
        break;

      case "i":
        if(event.shiftKey){
          event.preventDefault(); 
          setSelectedTool("image")
        }
        break;

      case "r":
        if(event.shiftKey){
          event.preventDefault(); 
          setSelectedTool("rectangle")
        }
        if(event.ctrlKey){
          event.preventDefault(); 
          rotateCanvas()
        }
        break;
      
      case "c":
        if(event.shiftKey){
          event.preventDefault(); 
          brushColorRef.current.click()
        }
        break;

    }
  }
  //Function for going one step back in canvas state stack history
  function stepBack(){
    //Trigger upon pressing z
    if(stateStack.current.length > 0){
      //If length of stack is one reset the canvas completely, otherwise erase the last one
      if (stateStack.current.length == 1 || currentStateIndex.current == 0) {
        //Pop the last state
        stateStack.current.pop()
        //Get canvas and ctx
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
        //Reset the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        //Set current state index back to 0
        currentStateIndex.current = 0
      }else{
        //Pop the last state
        const newStateIndex = currentStateIndex.current - 1
        //Load the previous state
        ctxRef.current.putImageData(stateStack.current[newStateIndex], 0, 0)
        //Decrease current state index
        currentStateIndex.current = currentStateIndex.current - 1
      }
    }
  }

  //Function for going one step forward in canvas state stack history
  function stepForward() {
    //Run only if the current state isnt the newest one
    if(stateStack.current.length > currentStateIndex.current + 1){
      //Load next state
      const newStateIndex = currentStateIndex.current + 1
      ctxRef.current.putImageData(stateStack.current[newStateIndex], 0, 0)
      //Increase current state index
      currentStateIndex.current = currentStateIndex.current + 1
    }   
  }
  //Function for rotating canvas 90 degrees clockwise
  function rotateCanvas(){
    //Get canvas and context
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d"); 
    const heightRatio = canvas.height/canvas.width
    const widthRatio = canvas.width/canvas.height
    //Create image from the old canvas
    const tempSrc = canvas.toDataURL();
    const tempImage = new Image();
    tempImage.src = tempSrc;
    //Wait for the image to load
    tempImage.onload = () => {
      //Clear canvas, rotate it and draw image
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.save()
      ctx.translate(canvas.width/2, canvas.height/2)
      ctx.rotate(90 * Math.PI/180)
      ctx.drawImage(tempImage , (-tempImage.width/2) * heightRatio, (-tempImage.height/2) * widthRatio)
      ctx.restore();
      //Save to stack
      saveToStack()
    }
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
    //Debug
    console.log(offsetX, offsetY)
    //Set textbox visible
    setShowTextbox(!showTextbox);
    
    const handleKeyPress = function(event){
      if(event.key === "Enter" && !event.shiftKey){
        //Get textbox and its text
        const textbox = textboxRef.current;
        const text = textbox.value;
        //Print the text
        handleBlur(text);
        //Remove the event listener
        textboxRef.current.removeEventListener("keypress", handleKeyPress)
        //Set the visibility to false
        setShowTextbox(false);
      }
    }

    if (!showTextbox) {
      //Set position of written text
      textboxTextPos.current = { x: offsetX, y: offsetY }
      //Set isTyping to false
      isTyping.current = true;
      //Display the texbox
      const textbox = textboxRef.current;
      textbox.style.display = "block";
      //Focus the textbox and add event listener
      setTimeout(() => {
        textbox.focus();
        textboxRef.current.addEventListener("keypress", handleKeyPress)
      }, 0);
    } else {
      //Gets textbox and current text
      const textbox = textboxRef.current;
      const text = textbox.value;
      //Prints the text
      handleBlur(text);
    }
    
  }
  
  function handleBlur(val) {
    if (isTyping.current) { 
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d");
      ctx.font = brushSizeRef.current.value*10 + "px Arial";
      ctx.fillStyle = brushColor.current
      ctx.fillText(val, textboxTextPos.current.x, textboxTextPos.current.y);
      isTyping.current = false;
      const textbox = textboxRef.current;
      textbox.style.display = "none";
      textbox.value = "";
      //Save canvas state to stack
      saveToStack()

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
    "rightTriangle": shapeDownHandle,
    "diamond": shapeDownHandle,
    "pentagon": shapeDownHandle,
    "hexagon": shapeDownHandle,
    "4star": shapeDownHandle,
    "5star": shapeDownHandle,
    "horizontalArrow": shapeDownHandle,
    "verticalArrow": shapeDownHandle,
    "line": shapeDownHandle,
    "image": handleImgMouseDown,
    "pipet": colorPicker,
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
    "rightTriangle": shapeMoveHandle,
    "diamond": shapeMoveHandle,
    "pentagon": shapeMoveHandle,
    "hexagon": shapeMoveHandle,
    "4star": shapeMoveHandle,
    "5star": shapeMoveHandle,
    "horizontalArrow": shapeMoveHandle,
    "verticalArrow": shapeMoveHandle,
    "line": shapeMoveHandle,
    "image": imgMoveThrottle,
    "pipet": null,
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
    "rightTriangle": shapeUpHandle,
    "diamond": shapeUpHandle,
    "pentagon": shapeUpHandle,
    "hexagon": shapeUpHandle,
    "4star": shapeUpHandle,
    "5star": shapeUpHandle,
    "horizontalArrow": shapeUpHandle,
    "verticalArrow": shapeUpHandle,
    "line": shapeUpHandle,
    "image": mouseImgUpHandle,
    "pipet": null,
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
    "rightTriangle": "auto",
    "diamond": "auto",
    "pentagon": "auto",
    "hexagon": "auto",
    "4star": "auto",
    "5star": "auto",
    "horizontalArrow": "auto",
    "verticalArrow": "auto",
    "line": "auto",
    "image": "auto",
    "pipet": null,
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
    //Save canvas state to stack
    saveToStack()
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
      case "rightTriangle":
        ctx.moveTo(endX, endY)
        ctx.lineTo(startX, endY)
        ctx.lineTo(startX, startY)
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
    //Save canvas state to stack
    saveToStack()
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
    //Save canvas state to stack
    saveToStack()
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
        date: new Date().toISOString() 
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
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke()
    }
  }

  //Function for stopping drawing when the user lets go of the mouse button
  function mouseUpHandle(){
    setDrawing(false)
    //Save canvas state to stack
    saveToStack()
    ctxRef.current.lineCap = "butt";
    ctxRef.current.lineJoin = "miter";
  }

  //Function for clearing the canvas
  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctxRef.current = ctx
    //Save canvas state to stack
    saveToStack()
    
  }
//-------------------------------------------------------------------------function for rotating canvas - doesnt work yet----------------------------------------------


  //Function for converting hex to rgba format
  function hexToRGBA(hex, alpha){
    let r = parseInt(hex.slice(1, 3), 16)
    let g = parseInt(hex.slice(3, 5), 16)
    let b = parseInt(hex.slice(5, 7), 16)

    if(alpha){
      console.log("rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")")
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    }
  }
  //Function for converting rgba to hex format
  function rgbaToHex(r, g, b, a = 255) {

    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    a = Math.max(0, Math.min(255, a));

    const toHex = (value) => value.toString(16).padStart(2, "0");

    return a === 255
        ? `#${toHex(r)}${toHex(g)}${toHex(b)}`
        : `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
  }

  //Function for changing working color upon clicking somewhere with the pipet tool
  function colorPicker(event){
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");
    const {offsetX, offsetY} = getMousePos(event)
    const pixel = ctx.getImageData(offsetX, offsetY, 1, 1)
    if(pixel){
      let r = pixel.data[0]
      let g = pixel.data[1]
      let b = pixel.data[2]
      let alpha = pixel.data[3]
      brushColor.current =rgbaToHex(r,g,b)
      brushColorRef.current.value =rgbaToHex(r,g,b)
      console.log(brushColor.current)
      changeBrushColor()
    }
  }

  //Function for changing brush color
  function changeBrushColor() {
    brushColor.current = brushColorRef.current.value
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = brushColor.current;
    ctxRef.current = ctx
    console.log(brushColor.current)
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
  


  //Ref for checking whether the sidebar  is open
  const [isSidebarOpen, setSidebarOpen] = useState(false);  
  //Resize canvas when sidebar is toggled
  useEffect(() => {
    setTimeout(() => {
      resizeCanvas();
    }, 300);
  },[isSidebarOpen])
  //Function for toggling the sidebar
  function handleSidebar(){
    setSidebarOpen(!isSidebarOpen)
  }


  return (
    <>
    
    <div className="AllPostBlur" ref={blurRef}></div>
    <AppSidebar 
      queryData={queryData}
      openSavedCanvas={openSavedCanvas}
      updateName={updateName}
      deleteData={deleteData}
      blurRef={blurRef}
      handleSidebar={handleSidebar}
    />
    <main>
      <div className="Main">

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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save size-8"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>
              <div className="ActionSaveMenu" ref={actionMenuRef} >

                  {/*Save to db*/}
                  <div className="ActionSaveItem"  onClick={() => {toggleMenu("flex", saveMenuRef);  toggleMenu("flex", actionMenuRef);}}>
                    <div className="ActionSaveItemIcon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download size-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </div>
                    <div className="ActionSaveItemText" >
                      <p>Save</p>
                    </div>
                  </div>

                  {/*Update to db*/}
                  {updatableImg && 
                  <>
                  <div className="ActionSaveItem" onClick={() => updateData(updateId)}>
                    <div className="ActionSaveItemIcon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save size-6"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>
                    </div>
                    <div className="ActionSaveItemText">
                      <p>Update</p>
                    </div>
                  </div>
                  </>
                  }

                  {/*Save as png*/}
                  <a ref={pngSaveRef}>
                    <div className="ActionSaveItem"  onClick={saveCanvasAsPng}>
                      <div className="ActionSaveItemIcon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-image size-6"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="10" cy="12" r="2"/><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"/></svg>
                      </div>
                      <div className="ActionSaveItemText">
                        <p>Export as Png</p>
                      </div>
                    </div>
                  </a>

                  {/*Save as pdf*/}
                  <div className="ActionSaveItem" onClick={saveCanvasAsPdf}>
                    <div className="ActionSaveItemIcon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text size-6"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                    </div>
                    <div className="ActionSaveItemText">
                      <p>Export as Pdf</p>
                    </div>
                  </div>

              </div>
            </div>

            {/*clear canvas*/}
            <div className="ActionTool" aria-label='ctrl + x'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash size-8" onClick={clearCanvas}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            {/*Step back*/}
            <div className="ActionTool" aria-label='ctrl + z'>
              {/*<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-big-left size-8" onClick={stepBack}><path d="M18 15h-6v4l-7-7 7-7v4h6v6z"/></svg>*/}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-undo-2 size-8" onClick={stepBack}><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
            </div>
            {/*Step forward*/}
            <div className="ActionTool" aria-label='ctrl + y'>
              {/*<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-big-right size-8" onClick={stepForward}><path d="M6 9h6V5l7 7-7 7v-4H6V9z"/></svg>*/}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-redo-2 size-8" onClick={stepForward}><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg>
            </div>
            {/*Rotate canvas */}
            <div className="ActionTool" aria-label='ctrl + r'>
              {/*<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw-square size-8" onClick={rotateCanvas}><path d="M12 5H6a2 2 0 0 0-2 2v3"/><path d="m9 8 3-3-3-3"/><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/></svg>*/}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw size-8" onClick={rotateCanvas}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>            
            </div>


          </div>

          {/*Menu with tools*/}
          <div className="ToolMenu">
            {/*Image Tool*/}
            <div className="Tool" id="ImageInputButton" onMouseOver =  {() => toggleMenu("flex", imageMenuRef)} onMouseOut={() => toggleMenu("none", imageMenuRef)} aria-label='shift + i'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image size-8" onClick={() => setSelectedTool("image")}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
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
            <div className="Tool" aria-label='shift + b'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brush size-8" onClick={() => setSelectedTool("brush")}><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></svg>
            </div>
            {/*Bucket Tool*/}
            <div className="Tool" aria-label='shift + f'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paint-bucket size-8" onClick={() => setSelectedTool("bucket")}><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>
            </div>
            {/*Eraser Tool*/}
            <div className="Tool" aria-label='shift + e'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eraser size-8" onClick={() => setSelectedTool("eraser")}><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
            </div>
            {/*Text Tool*/}
            <div className="Tool" aria-label='shift + t'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-type-outline size-8" onClick={() => setSelectedTool("text")}><path d="M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z"/></svg>
            </div>
            {/*Shape Tool*/}
            {/*<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shapes"><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/></svg> */}
            <div className="Tool" id='ShapeSelectTool'>
              <ul id="ShapeSelect">
                <li id="ShapeSelectHover">
                  {/*The shape tool icon */}
                  <a>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square size-8" onClick={() => setSelectedTool("rectangle")}><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  </a>
                  {/*The shape menu */}
                  <ul className="ShapeSelectList">
                    {/*Square */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("rectangle")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square size-8"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
                    </li>
                    {/*Circle */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("circle")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle size-8"><circle cx="12" cy="12" r="10"/></svg>
                    </li>
                    {/*Triangle */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("triangle")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle size-8"><path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
                      </li>
                    {/* Right Triangle */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("rightTriangle")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-right size-8"><path d="M22 18a2 2 0 0 1-2 2H3c-1.1 0-1.3-.6-.4-1.3L20.4 4.3c.9-.7 1.6-.4 1.6.7Z"/></svg>
                    </li>
                    {/*Diamond */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("diamond")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-diamond size-8"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/></svg>                    </li>
                    {/*Pentagon */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("pentagon")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pentagon size-8"><path d="M10.83 2.38a2 2 0 0 1 2.34 0l8 5.74a2 2 0 0 1 .73 2.25l-3.04 9.26a2 2 0 0 1-1.9 1.37H7.04a2 2 0 0 1-1.9-1.37L2.1 10.37a2 2 0 0 1 .73-2.25z"/></svg>
                    </li>
                    {/*Hexagon */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("hexagon")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hexagon size-8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    </li>
                     {/*4 pointed star -----musim predelat ikonku---*/}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("4star")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkle size-8"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>

                    </li>
                    {/*5 pointed star */}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("5star")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star size-8"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                    </li>
                    {/*Horizontal arrow*/}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("horizontalArrow")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-move-right size-8"><path d="M18 8L22 12L18 16"/><path d="M2 12H22"/></svg>
                    </li>
                    {/*Vertical arrow*/}
                    <li className="ShapeSelectItem" onClick={() => setSelectedTool("verticalArrow")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-move-up size-8"><path d="M8 6L12 2L16 6"/><path d="M12 2V22"/></svg>
                    </li>

                    {/*Line */}
                    <li className="ShapeSelectItem" id="BottomShape" onClick={() => setSelectedTool("line")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus size-8"><path d="M5 12h14"/></svg>
                    </li>

                  </ul>

                </li>
              </ul>
            </div>
            {/*Fill Tool*/}
            <div className="Tool" id="FillTool" aria-label='ctrl + f'>
              <p className="FillTitle">Fill</p>
              <label className="checkBox"> 
                <input id="ch1" type="checkbox"ref={fillCheckRef}/>
                <div className="transition"></div>
              </label>
            </div>
            {/*Pipet Tool*/}
            <div className="Tool" id='pipetTool' aria-label='shift + p'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pipette size-8" onClick={() => setSelectedTool("pipet")}><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>
            </div>
            {/*Brush Color*/}
            <div className="Tool" id="BrushColorTool" aria-label='shift + c'>
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

        <div className="Content">

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
                id='textToolTextarea'
                placeholder="Enter text here..."
                className="textbox"></textarea>
            )}

        </div>
        {/* 
        <canvas ref={textureCanvasref} style={{display:"none"}}></canvas>
*/}
      </div>
      </main>
      <img className="hiddenImg" ref={hiddenImgRef}></img>
      
    </>
  );
}
export default Home;