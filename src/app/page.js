"use client";

import Image from "next/image";
import "./../styles/canvas.css";
import { useEffect, useState, useRef, use } from 'react'
import { document } from "postcss";

function Canvas({moveFunc}) {
  return(

    <canvas id="myCanvas" width="400" height="200" onMouseMove={moveFunc}></canvas>
  )
}





export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isDrawing, setDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(4);
  const brushSizeRef = useRef(null)

  const brushColorRef = useRef(null)
  const brushColor = useRef("#ffffffs")


  const ctxRef = useRef(null)
  const canvasRef = useRef(null)

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

            <div className="SettingsMenuItem">
              <div className="SettingsMenuItemTitle">
                <p>Brush color</p>
              </div>
              <form id="brushColorForm">
                <input type="color" name="brushColor" id="brushColor"  onChange={changeBrushColor}  ref={brushColorRef}/>
              </form>
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

          </div>
        </div>
        <div className="Content">

          <div className="ContentTitle">
            <p>X: {mousePos.x}, Y: {mousePos.y}</p>
          </div>

          <div className="ContentCanvas">
            <canvas id="myCanvas" width="400" height="200" 
            ref={canvasRef}
            onMouseMove={mouseMoveHandle} 
            onMouseDown={mouseDownHandle}
            onMouseUp={mouseUpHandle}
            ></canvas>
          </div>

        </div>

      </div>

    </>
  );
}
