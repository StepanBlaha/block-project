"use client";
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
import { HiOutlineTrash } from "react-icons/hi";
import { Canvas, Textbox, StaticCanvas, FabricText } from 'fabric'
import { BeakerIcon } from '@heroicons/react/24/solid'
import { Stage, Layer, Text } from "react-konva";

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

  const shapeStartPoint = useRef(null);
  const shapeEndPoint = useRef(null);

  const fillCheckRef = useRef(null)




  //Dictionary that calls the correct function based on the selected tool
  const canvasClickActions = {
    "brush": mouseDownHandle,
    "bucket": bucketFillCanvas,
    "eraser": mouseEraserDownHandle,
    "text": drawText,
    "rectangle": shapeDownHandle,
    "circle": shapeDownHandle
  }

  const canvasMouseMoveActions = {
    "brush": mouseMoveHandle,
    "bucket": null,
    "eraser": mouseEraserMoveHandle,
    "text": null,
    "rectangle":  null,
    "circle": null
  }

  const canvasMouseUpActions = {
    "brush": mouseUpHandle,
    "bucket": null,
    "eraser": mouseEraserUpHandle,
    "text": null,
    "rectangle": shapeUpHandle,
    "circle": shapeUpHandle
  }
  //Dictionary that sets the correct cursor icon based on the selected tool
  const cursors = {
    "brush": "url('/paint-brush.png') 0 16, auto",
    "bucket": "url('/bucket.png'), auto",
    "eraser": "url('/eraser.png') 0 16, auto",
    "text": "text",
    "rectangle": "auto",
    "circle": "auto"
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
    ctx.globalCompositeOperation="source-over";
    ctx.fillStyle = brushColor.current
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctxRef.current = ctx
  }
  


  function createShape() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");
    const fillCheck = fillCheckRef.current
    ctx.globalCompositeOperation="source-over";
    const { x: startX, y: startY } = shapeStartPoint.current;
    const { x: endX, y: endY } = shapeEndPoint.current;
    ctx.beginPath()
    switch (selectedTool) {
      case "rectangle":
        ctx.rect(startX, startY, (endX - startX), (endY - startY))
        break;
      case "circle":
        const radius = Math.abs(Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2));
        ctx.arc(startX, startY, radius, 0, Math.PI * 2)
        break;
    }
    if (fillCheck.checked) {
      ctx.fillStyle = brushColor.current
      ctx.fill()
    }
    ctx.stroke()
    ctxRef.current = ctx
    fillCheckRef.current  = fillCheck
  }
  function shapeDownHandle(event) {
    const {offsetX, offsetY} = getMousePos(event)
    shapeStartPoint.current = { x: offsetX, y: offsetY };
  }
  function shapeUpHandle(event) {
    const {offsetX, offsetY} = getMousePos(event)
    shapeEndPoint.current = { x: offsetX, y: offsetY };
    createShape()
  }

  


  function drawText(event) {
    const { offsetX, offsetY } = getMousePos(event)
    const canvas = canvasRef.current
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const fbCanvas = new Canvas(canvas)
    const text = new TextBox("Click here", {
      left: offsetX,
      top: offsetY,
      fontSize: 20,
      fill: "black",
    })
    fbCanvas.add(text)
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
    ctx.globalCompositeOperation="destination-out";
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke()
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


  return (
    <>
      <div className="Main">
        
        <div className="Menu">
          <div className="ActionMenu">
            
            <div className="ActionTool">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-floppy size-10" viewBox="0 0 16 16" onClick={sendData}>
                <path d="M11 2H9v3h2z"/>
                <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
              </svg>
            </div>
            
            <div className="ActionTool">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash size-10" viewBox="0 0 16 16" onClick={clearCanvas}>
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
              </svg>
            </div>


          </div>

          <div className="ToolMenu">

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

                    <li className="ShapeSelectItem">
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