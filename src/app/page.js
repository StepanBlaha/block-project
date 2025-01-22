"use client";

import Image from "next/image";
import "./../styles/canvas.css";
import { useEffect, useState, useRef } from 'react'
import { document } from "postcss";

function Canvas({moveFunc}) {
  return(

    <canvas id="myCanvas" width="400" height="200" onMouseMove={moveFunc}></canvas>
  )
}





export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isDrawing, setDrawing] = useState(false)
  const ctxRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(()=>{
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 10;
    ctxRef.current = ctx
  })

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




  return (
    <>
      <h1>Drawing App</h1>
      <canvas></canvas>
      <p>X: {mousePos.x}, Y: {mousePos.y}</p>
      <Canvas moveFunc={mouseMoveHandle}/>
      <canvas id="myCanvas" width="400" height="200" 
      ref={canvasRef}
      onMouseMove={mouseMoveHandle} 
      onMouseDown={mouseDownHandle}
      onMouseUp={mouseUpHandle}
      ></canvas>

    </>
  );
}
