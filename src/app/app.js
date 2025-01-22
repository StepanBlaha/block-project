import { useEffect, useState } from 'react'

function DrawingApp() {



  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  
  // Draw a rectangle
  ctx.fillStyle = "blue";
  ctx.fillRect(50, 50, 100, 100);

  // Draw a circle
  ctx.beginPath();
  ctx.arc(200, 100, 50, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();

    return (
        <>
            <h1>Drawing App</h1>
            <canvas id="myCanvas" width="400" height="200"></canvas>
        </>
    )
    
}

export default DrawingApp