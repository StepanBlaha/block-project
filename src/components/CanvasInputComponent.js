import { useEffect } from 'react';

const CanvasInputComponent = () => {
  useEffect(() => {
    // Dynamically create and add the CanvasInput script to the document
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/SE7ENSKY/CanvasInput@master/dist/canvasinput.min.js';
    script.onload = () => {
      // Initialize CanvasInput after the script is loaded
      const canvas = document.getElementById('myCanvas');
      new CanvasInput({
        canvas: canvas,
        x: 50,
        y: 50,
        fontSize: 24,
        width: 400,
        height: 40,
        borderColor: '#000',
        borderWidth: 2,
        backgroundColor: '#f0f0f0',
        placeholder: 'Enter text here...',
      });
    };
    document.body.appendChild(script);
    return () => {
      // Clean up when the component is unmounted
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <canvas id="myCanvas" width="800" height="600" style={{ border: '1px solid black' }}></canvas>
    </div>
  );
};

export default CanvasInputComponent;