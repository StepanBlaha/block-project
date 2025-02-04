"use client";


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




/*
menu icon
HiOutlineMenu

pen icon
HiOutlinePencil

print icon
HiOutlinePrinter

trash icon
HiOutlineTrash
*/





const Home = () => {
  //Reference for link to save canvas as png
  const pngSaveRef = useRef(null)

  //State containing currently selected tool
  const [selectedTool, setSelectedTool] = useState("brush")

  //Reference for the save&export menu
  const actionMenuRef = useRef(null)

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




  function detectTyping(event) {
    const { offsetX, offsetY } = getMousePos(event);
    const boxOffsetX = (event.clientX );
    const boxOffsetY = (event.clientY );
    setTextboxPos({ x: boxOffsetX, y: boxOffsetY });
    
    setTextboxTextPos({ x: offsetX, y: offsetY });
    console.log(offsetX, offsetY)
    setShowTextbox(!showTextbox);
    
    if (!showTextbox) {
      isTyping.current = true;
      const textbox = textboxRef.current;
      textbox.style.display = "block";
      textbox.focus();
      
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
      ctx.font = brushSizeRef.current.value + "px Arial";
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
    "image": handleImgMouseDown
  }
  //Dictionary that calls the correct function based on the selected tool
  const canvasMouseMoveActions = {
    "brush": mouseMoveHandle,
    "bucket": null,
    "eraser": mouseEraserMoveHandle,
    "text": null,
    "rectangle":  null,
    "circle": null,
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
    "image": "auto"
  }

  //Function for setting the cursor icon based on the selected tool 
  function setCursorIcon() {
    const canvas = canvasRef.current
    canvas.style.cursor = cursors[selectedTool]
    canvasRef.current = canvas
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
  //Function for creating the shape
  function createShape() {
    //Gets the canvas element
    const canvas = canvasRef.current
    //Gets the context element
    const ctx = canvas.getContext("2d");
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
    }
    //If the fillcheck  = true fills the shape
    if (fillCheck.checked) {
      ctx.fillStyle = brushColor.current
      ctx.fill()
    }
    //Does the stroke
    ctx.stroke()
    //Sets the current context to context
    ctxRef.current = ctx
    fillCheckRef.current  = fillCheck
  }
  //Function for handling mousedown when holding any shape tool
  function shapeDownHandle(event) {
    //Gets the mouse position
    const {offsetX, offsetY} = getMousePos(event)
    //Sets the shape start point to current mouse position
    shapeStartPoint.current = { x: offsetX, y: offsetY };
  }
  //Function for handling mouseup when holding any shape tool
  function shapeUpHandle(event) {
    //Gets the mouse position
    const {offsetX, offsetY} = getMousePos(event)
    //Sets the shape end point to current mouse position
    shapeEndPoint.current = { x: offsetX, y: offsetY };
    //Calls the function to create the shape
    createShape()
  }

  

  
    function drawText(event) {
      const { offsetX, offsetY } = getMousePos(event)
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d");
      const text = "nigga"
      ctx.font = "30px Arial";
      ctx.fillStyle = brushColor.current
      ctx.fillText(text, offsetX, offsetY);
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



  //For fetching data from database on reload
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

  //For updating data in database
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

//For sending data to database
  const sendData = async () => {
    try {
      // Set the sending state to true
      setSending(true);
      // Get the canvas and convert it to a data URL
      const canvas = canvasRef.current
      const canvasUrl = canvas.toDataURL()
      const canvasData = {
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
      } else {
        console.error('Failed to create post:', response.statusText);
      }
    }catch (error) {//Catch any errors
      console.error("Error sending data:", error);
    }finally {//Finally set the sending state to false
      setSending(false);
    }
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

  //Old function for saving canavas data
  function saveCanvas() {
    const canvas = canvasRef.current
    const canvasUrl = canvas.toDataURL()
    const data = {image: canvasUrl, date: Date.now()}
    const jsonData = JSON.stringify(data)
    const file = new Blob([jsonData], {type : "application/json"})
    console.log(file)
    const fr = new FileReader();
    fr.onload = function(){
      const res = JSON.parse(fr.result)
      console.log(res)
    }
    fr.readAsText(file)
  }

  //Initial canvas setup
  useEffect(()=>{
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 10;
    ctxRef.current = ctx
    canvasRef.current = canvas
  },[])

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

  //Function for showing and hiding the save action menu
  function toggleSaveActionMenu(value){
    const menu = actionMenuRef.current
    menu.style.display = value
  }

  const userImgFormRef = useRef(null)
  const userImgRef = useRef(null)
  const isDraggable = useRef(false)
  const imagePosition  = useRef({x: 0,y: 0})
  const preImageCanvas = useRef(null)
  const preImageCtx = useRef(null)

  
  function handleUserImg(e){
    e.preventDefault();
    
    const inputData = userImgFormRef.current.value
    userImgRef.current = inputData
    console.log(inputData)
    const currentX = canvasRef.current.width/2
    const currentY = canvasRef.current.height/2
    //Tady dam draw a namaluju to do stredu
    //image dam do samostatnyho objektu new Image()
    drawImage(0, 0)
  }

  //Function for geting the dimensions of loaded img
  function getImageSize() {
    return new Promise((resolve, reject) => {
      //Create img
      const img = new Image();
      const imgSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAZlBMVEX///8DtYUAsn9hxqOm3cmT2sP6/v0iuYxDwpwXuo0AsHsAt4fC697i9vIAtIIAsH2s4tFiy6s5wJjQ7+VXw5500LNqyai75dWE1LvV8Oi05dVSxqPo9/MvvZPx+/nI6+CJ1r560LQdEhHrAAACX0lEQVR4nO3c23LaMBRGYUkFgg3INiQcwiHN+79k3V6kQyxruwcy9j/ru8/Ga3xA8SRyDgAAAAAAAAAAAAAAAAAAAAAAAACAUdo9f7PsX+brzZ/M3BsDnw+PqklZl9EWQhm3x91i4MyVMa6cPTTpk3Xww7SZxctp0MwnY1QYZ+GvynL5OmDmhAvbxqpYmzMnXfjzaj1fjJkTL2wbY52fOflC78sm+1gVKPThesvMVCj0scjcjBKFPq76lzkahW1i74UqUujjVr3Qh0a90Iee70WdQh/St6JQYTyrF/rwpl6Yfp4qFfqQ+l1KqjB5EqUKfZlYvGkVhnf1wnhVL/RV9zIVKwxz9cLEukas0D913tmoFfrO+wy1wtB51S9X2Fm4yRV2jndkhdU/F3a+Lr608LYx1HFlGHnhrDT0vjD7UIy80LjN4tKasKCQQgoppJBCCimkkEIKKaSQQgoppJBCCimkkEIKKaSQQgop/PvCK4WTL9xG9cJGvnBufOj0C2v5wp3xV0jTL7zI34fWw1SgcC5fuCvVC53xEwKF+W9EhcJN9kZUKHT7XKJE4Sb3uRKF7j1zEjUKb5mVm0ZhbvktUujOvdepSuFt1ZeoUuhOfbeiTKF77flwnUI3S6/AhQpdnUxUKnSHmHjcSBW6U9E9Aq1C55rOI1Wt0B0+n0a5Qrc4xrvD0Ctsh3xfVb8fOYqF7Zh6GUN8RKGxxWww/8NyURg7ylaDCluXuinKMvznPWgP1jbBia1J7i0aa1dgYyfM+2m7+rj/2n2EAQAAAAAAAAAAAAAAAAAAAAAAAAD48APbPUv6XuH4DQAAAABJRU5ErkJggg=="
      img.src = imgSrc

      //Upon loading get img size
      img.onload = () => {

        const imgWidth = img.width;
        const imgHeight = img.height;
        console.log(`width: ${imgWidth}`);
        console.log(`height: ${imgHeight}`);
        // Resolve with dimensions
        resolve({ imgWidth, imgHeight });
      };
  
    });
  }
  //Function for drawing the image on the canvas
  function  drawImage(x, y){
    return new Promise((resolve, reject) => {
      // Get the canvas and context
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
  
      const img = new Image();
      const imgSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAZlBMVEX///8DtYUAsn9hxqOm3cmT2sP6/v0iuYxDwpwXuo0AsHsAt4fC697i9vIAtIIAsH2s4tFiy6s5wJjQ7+VXw5500LNqyai75dWE1LvV8Oi05dVSxqPo9/MvvZPx+/nI6+CJ1r560LQdEhHrAAACX0lEQVR4nO3c23LaMBRGYUkFgg3INiQcwiHN+79k3V6kQyxruwcy9j/ru8/Ga3xA8SRyDgAAAAAAAAAAAAAAAAAAAAAAAACAUdo9f7PsX+brzZ/M3BsDnw+PqklZl9EWQhm3x91i4MyVMa6cPTTpk3Xww7SZxctp0MwnY1QYZ+GvynL5OmDmhAvbxqpYmzMnXfjzaj1fjJkTL2wbY52fOflC78sm+1gVKPThesvMVCj0scjcjBKFPq76lzkahW1i74UqUujjVr3Qh0a90Iee70WdQh/St6JQYTyrF/rwpl6Yfp4qFfqQ+l1KqjB5EqUKfZlYvGkVhnf1wnhVL/RV9zIVKwxz9cLEukas0D913tmoFfrO+wy1wtB51S9X2Fm4yRV2jndkhdU/F3a+Lr608LYx1HFlGHnhrDT0vjD7UIy80LjN4tKasKCQQgoppJBCCimkkEIKKaSQQgoppJBCCimkkEIKKaSQQgop/PvCK4WTL9xG9cJGvnBufOj0C2v5wp3xV0jTL7zI34fWw1SgcC5fuCvVC53xEwKF+W9EhcJN9kZUKHT7XKJE4Sb3uRKF7j1zEjUKb5mVm0ZhbvktUujOvdepSuFt1ZeoUuhOfbeiTKF77flwnUI3S6/AhQpdnUxUKnSHmHjcSBW6U9E9Aq1C55rOI1Wt0B0+n0a5Qrc4xrvD0Ctsh3xfVb8fOYqF7Zh6GUN8RKGxxWww/8NyURg7ylaDCluXuinKMvznPWgP1jbBia1J7i0aa1dgYyfM+2m7+rj/2n2EAQAAAAAAAAAAAAAAAAAAAAAAAAD48APbPUv6XuH4DQAAAABJRU5ErkJggg=="
      console.log(imgSrc)
      img.src = imgSrc

      img.onload = () => {
        console.log("Image loaded");
        ctx.drawImage(img, x, y);
        console.log("Image Drawn");
  
        const imgWidth = img.width;
        const imgHeight = img.height;
  
        console.log(`width: ${imgWidth}`);
        console.log(`height: ${imgHeight}`);
  
        // Resolve with dimensions
        resolve({ imgWidth, imgHeight });
      };
      canvasRef.current = canvas
      ctxRef.current = ctx
  

    });
  }

  //Function for handling clicking with image tool selected
  async function handleImgMouseDown(event){
    preImageCanvas.current = canvasRef.current
    preImageCtx.current = ctxRef.current
    const {offsetX, offsetY} = getMousePos(event)
    
    const {imgWidth, imgHeight} = await getImageSize()
    console.log(imagePosition.current.x)

    console.log(imgWidth)
    if(
      offsetX >= imagePosition.current.x && offsetX <= imagePosition.current.x + imgHeight &&
      offsetY >= imagePosition.current.y && offsetY <= imagePosition.current.y + imgWidth
    ){
      console.log("image  clicked")
      isDraggable.current = true
    }
  }




function resetCanvas(){
  canvasRef.current = preImageCanvas.current
  ctxRef.current = preImageCtx.current
}
   
  function mouseImgMoveHandle(event){
    if(isDraggable.current){
      setTimeout(()=>{
        resetCanvas()
        let {offsetX, offsetY} = getMousePos(event)
        drawImage(offsetX, offsetY)
      },400)

    }
  }
  //Function for handling mouse up event while holding the img tool
  function mouseImgUpHandle(){
    isDraggable.current = false
  }














  function imageMouseDownHandle(event){
    const {offsetX, offsetY} = getMousePos(event)
    //if(
      //budu checkovat jestli je clicknuto v miste objektu
      //Potom udelam ten drag
      //offsetX <= ()

    //)
  }

  return (
    <>
      
      <div className="Main">
        
        <div className="Menu">
          <div className="ActionMenu">
            
            <div className="ActionTool" id="SaveMenuButton" onMouseOver={() => toggleSaveActionMenu("flex")} onMouseOut={() => toggleSaveActionMenu("none")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-floppy size-10" viewBox="0 0 16 16" >
                <path d="M11 2H9v3h2z"/>
                <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
              </svg>

              <div className="ActionSaveMenu" ref={actionMenuRef} >

                  <div className="ActionSaveItem" onClick={sendData}>

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

          <div className="ToolMenu">


            <div className="Tool" id="ImageInputButton">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10"  onClick={() => setSelectedTool("image")}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
              </svg>

                <div className="ImageInputCard">

                  <div className="InputCardSection">
                    <p className="InputCardTitle">Select Image</p>
                  </div>
                  <div className="InputCardSection" id="FormCardSection">
                    <form className="ImageInputForm" onSubmit={handleUserImg}>
                      <input type="file" accept=".png, .jpeg, .jpg, image/png, image/jpeg" className="ImageInput" ref={userImgFormRef}/>
                      <input type="submit" id="ImageInputSubmit"/>
                    </form>
                  </div>
                </div>

            </div>

            <div className="Tool">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10"  onClick={() => setSelectedTool("brush")}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
              </svg>
            </div>

            <div className="Tool">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-paint-bucket size-10" viewBox="0 0 16 16" onClick={() => setSelectedTool("bucket")}>
                <path d="M6.192 2.78c-.458-.677-.927-1.248-1.35-1.643a3 3 0 0 0-.71-.515c-.217-.104-.56-.205-.882-.02-.367.213-.427.63-.43.896-.003.304.064.664.173 1.044.196.687.556 1.528 1.035 2.402L.752 8.22c-.277.277-.269.656-.218.918.055.283.187.593.36.903.348.627.92 1.361 1.626 2.068.707.707 1.441 1.278 2.068 1.626.31.173.62.305.903.36.262.05.64.059.918-.218l5.615-5.615c.118.257.092.512.05.939-.03.292-.068.665-.073 1.176v.123h.003a1 1 0 0 0 1.993 0H14v-.057a1 1 0 0 0-.004-.117c-.055-1.25-.7-2.738-1.86-3.494a4 4 0 0 0-.211-.434c-.349-.626-.92-1.36-1.627-2.067S8.857 3.052 8.23 2.704c-.31-.172-.62-.304-.903-.36-.262-.05-.64-.058-.918.219zM4.16 1.867c.381.356.844.922 1.311 1.632l-.704.705c-.382-.727-.66-1.402-.813-1.938a3.3 3.3 0 0 1-.131-.673q.137.09.337.274m.394 3.965c.54.852 1.107 1.567 1.607 2.033a.5.5 0 1 0 .682-.732c-.453-.422-1.017-1.136-1.564-2.027l1.088-1.088q.081.181.183.365c.349.627.92 1.361 1.627 2.068.706.707 1.44 1.278 2.068 1.626q.183.103.365.183l-4.861 4.862-.068-.01c-.137-.027-.342-.104-.608-.252-.524-.292-1.186-.8-1.846-1.46s-1.168-1.32-1.46-1.846c-.147-.265-.225-.47-.251-.607l-.01-.068zm2.87-1.935a2.4 2.4 0 0 1-.241-.561c.135.033.324.11.562.241.524.292 1.186.8 1.846 1.46.45.45.83.901 1.118 1.31a3.5 3.5 0 0 0-1.066.091 11 11 0 0 1-.76-.694c-.66-.66-1.167-1.322-1.458-1.847z"/>
              </svg>
            </div>

            <div className="Tool">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eraser size-10" viewBox="0 0 16 16" onClick={() => setSelectedTool("eraser")}>
                <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/>
              </svg>
            </div>

            <div className="Tool">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-fonts size-10" viewBox="0 0 16 16" onClick={() => setSelectedTool("text")}>
                <path d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479z"/>
              </svg>
            </div>

            <div className="Tool">

              <ul id="ShapeSelect">
                <li id="ShapeSelectHover">
                  <a>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-square size-8" viewBox="0 0 16 16" onClick={() => setSelectedTool("rectangle")}>
                      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  </a>
                  <ul className="ShapeSelectList">

                    <li className="ShapeSelectItem">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-square size-8" viewBox="0 0 16 16" onClick={() => setSelectedTool("rectangle")}>
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                      </svg>
                    </li>

                    <li className="ShapeSelectItem" id="BottomShape">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle size-8" viewBox="0 0 16 16" onClick={() => setSelectedTool("circle")}>
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                      </svg>
                    </li>

                  </ul>

                </li>
              </ul>
            </div>

            <div className="Tool">
              <form id="fillCheck" >
                <label>Fill</label>
                <input type="checkbox" id="fillCheckBox" name="fillCheckBox" ref={fillCheckRef}/>
              </form>
            </div>


            
            <div className="Tool">
              <form id="brushColorForm">
                <input type="color" name="brushColor" id="brushColor"  onChange={changeBrushColor}  ref={brushColorRef}/>
              </form>
            </div>

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
                  const { _id, image, date } = data;
                  return (
                    <div key={date} className="savedPost">
                      <p>{date}</p>
                      <div className="openSavedCanvasButton" onClick={() => openSavedCanvas(image, _id)}>
                        <p>Open</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="Content">

          <div className="ContentTitle">
            
          </div>

          <div className="ContentCanvas">
            <canvas id="myCanvas" width="400" height="200" 
            ref={canvasRef}
            onMouseMove={canvasMouseMoveActions[selectedTool]} 
            onMouseDown={selectedTool === "text" ? detectTyping : canvasClickActions[selectedTool]}
            onMouseUp={canvasMouseUpActions[selectedTool]}
            >
              
            </canvas>
            {selectedTool === "text" && (
              <textarea ref={textboxRef} style={{
                position: "fixed",
                top: textboxPos.y ,
                left: textboxPos.x,
                color: brushColor.current,
                border: "none",
                background: "none",
                fontSize: brushSize + "px",
              }}
                placeholder="Enter text here..."
                className="textbox"></textarea>
            )}
            
            

          </div>

        </div>

      </div>
      <img className="hiddenImg" ref={hiddenImgRef}></img>

    </>
  );
}
export default Home;