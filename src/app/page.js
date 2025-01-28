
'use client'
import Image from "next/image";
import { render } from "react-dom";

import "./../styles/canvas.css";
import { useEffect, useState, useRef, use } from 'react'
import React from 'react';
import { document } from "postcss";
import { notFound } from "next/navigation";
import { set } from "mongoose";
import { send } from "process";
import { map } from "jquery";





const Home = () => {

  const [selectedTool, setSelectedTool] = useState("brush")



  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isDrawing, setDrawing] = useState(false)
  const [isErasing, setErasing] = useState(false)
  const [brushSize, setBrushSize] = useState(4);
  
  const brushSizeRef = useRef(null)
  const brushColorRef = useRef(null)
  const brushColor = useRef("#ffffff")

  const ctxRef = useRef(null)
  const canvasRef = useRef(null)

  const hiddenImgRef = useRef(null)

  const [queryData, setQueryData] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [sending, setSending] = useState(false);

  const [updatableImg, setUpdatableImg] = useState(false);
  const [updateId, setUpdateId] = useState(null);





  //Dictionary that calls the correct function based on the selected tool
  const canvasClickActions = {
    "brush": mouseDownHandle,
    "bucket": bucketFillCanvas,
    "eraser": mouseEraserDownHandle
  }

  const canvasMouseMoveActions = {
    "brush": mouseMoveHandle,
    "bucket": null,
    "eraser": mouseEraserMoveHandle
  }

  const canvasMouseUpActions = {
    "brush": mouseUpHandle,
    "bucket": null,
    "eraser": mouseEraserUpHandle
  }
  //Dictionary that sets the correct cursor icon based on the selected tool
  const cursors = {
    "brush": "url('/paint-brush.png') 0 16, auto",
    "bucket": "url('/bucket.png'), auto"
  }
  //Function for setting the cursor icon based on the selected tool 
  function setCursorIcon() {
    const canvas = canvasRef.current
    canvas.style.cursor = cursors[selectedTool]
    canvasRef.current = canvas
  }
  useEffect(() => {
    setCursorIcon()
  },[selectedTool])
  //Function for filling the canvas with the selected color using bucket tool
  function bucketFillCanvas() {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    ctx.fillStyle = brushColor.current
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctxRef.current = ctx
  }








//Gumu udelam pres clearrect(e.offsetx, e.offsety, a pak rozmery mysi)


  function mouseEraserDownHandle(event){
    setErasing(true)
    const {offsetX, offsetY} = getMousePos(event)
    const ctx = ctxRef.current
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY)
  }
 function mouseEraserMoveHandle(event){
  const {offsetX, offsetY} = getMousePos(event)
  setMousePos({ x: offsetX, y: offsetY });
  if(isErasing){
    const ctx = ctxRef.current
    ctx.clearRect(offsetX, offsetY, brushSize, brushSize)
  }
 }
 function mouseEraserUpHandle(){
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

//For sending data to databade
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
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 10;
    ctxRef.current = ctx
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


  return (
    <>
      <div className="Main">
        <div className="Title">
          <h1>Drawing App</h1>
        </div>
        <div className="Sidebar">
          <div className="SettingsMenu">
            <div className="SettingsMenuItem">
              <div className="SettingsMenuItemTitle">
                <p>Brush Size</p>
              </div>
              <form id="brushSizeForm">
                <input type="range" name="brushSize" id="brushSize"  min="1" max="50"  value={brushSize} step="1" onChange={changeBrushSize}  ref={brushSizeRef}/>
              </form>
            </div>

            <div className="SettingsMenuItem" >
              <div className="SettingsMenuItemTitle">
                <p>Brush color</p>
              </div>
              <form id="brushColorForm">
                <input type="color" name="brushColor" id="brushColor"  onChange={changeBrushColor}  ref={brushColorRef}/>
              </form>
            </div>

            <div className="SettingsMenuItem">
              <div className="SettingsMenuItemTitle">
                <p>Brush</p>
              </div>
              <div className="ToolItem">
                <div className="ToolButton" onClick={() => setSelectedTool("brush")}>
                  <p>Pick</p>
                </div>
              </div>
            </div>

            <div className="SettingsMenuItem">
              <div className="SettingsMenuItemTitle">
                <p>Bucket</p>
              </div>
              <div className="ToolItem">
                <div className="ToolButton" onClick={() => setSelectedTool("bucket")}>
                  <p>Pick</p>
                </div>
              </div>
            </div>

            <div className="SettingsMenuItem">
              <div className="SettingsMenuItemTitle">
                <p>Clear canvas</p>
              </div>
              <div className="CanvasClear">
                <div className="CanvasClearButton" onClick={clearCanvas}>
                  <p>Clear</p>
                </div>
              </div>
            </div>

            <div className="SettingsMenuItem">
              <div className="SettingsMenuItemTitle">
                <p>Save canvas</p>
              </div>
              <div className="CanvasSave">
                <div className="CanvasSaveButton" onClick={sendData}>
                  <p>Save</p>
                </div>
              </div>
            </div>

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
            {updatableImg && 
              <div className="updateCanvasButton" onClick={() => updateData(updateId)}>
                <p>Update</p>
              </div>
            }
          </div>

          <div className="ContentCanvas">
            <canvas id="myCanvas" width="400" height="200" 
            ref={canvasRef}
            onMouseMove={canvasMouseMoveActions[selectedTool]} 
            onMouseDown={canvasClickActions[selectedTool]}
            onMouseUp={canvasMouseUpActions[selectedTool]}
            ></canvas>
          </div>

        </div>

      </div>
      <img className="hiddenImg" ref={hiddenImgRef}></img>

    </>
  );
}
export default Home;