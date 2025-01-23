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
  const brushSizeRef = useRef(null)
  const brushSize = useRef(1)

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

  function mouseDownHandle(){
    setDrawing(true)
    const ctx = ctxRef.current
    ctx.beginPath()
    ctx.moveTo(mousePos.x, mousePos.y)
  }

  function mouseMoveHandle(event){
    const { offsetX, offsetY } = event.nativeEvent
    setMousePos({ x: offsetX, y: offsetY });
    if (isDrawing) {
      const ctx = ctxRef.current
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke()
    }
  }
  function mouseUpHandle(){
    setDrawing(false)
  }

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
    brushSize.current = brushSizeRef.current.value
  }
  //Detects the change in brush size and updates the canvas brush size settings
  useEffect(() => { 
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = brushSize.current
    ctxRef.current = ctx
  }, [brushSize.current])



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
                <input type="range" name="brushSize" id="brushSize" min="1" max="100" step="1" onChange={changeBrushSize}  ref={brushSizeRef}/>
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
