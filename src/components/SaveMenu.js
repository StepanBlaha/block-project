import "./../styles/canvas.css";
import { useEffect, useState, useRef, use } from 'react'
import React from 'react';


const SaveMenu = (reference, updateRef, upId) =>{


     const [updatableImg, setUpdatableImg] = useState(false);
      const [updateId, setUpdateId] = useState(null);
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

    return(
        <>
        <div className="ActionSaveMenu" ref={reference} >

            <div className="ActionSaveItem">

                <div className="ActionSaveItemIcon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download size-6" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                    </svg>
                </div>

                <div className="ActionSaveItemText">
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



            <div className="ActionSaveItem">

                <div className="ActionSaveItemIcon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-filetype-png size-6" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zm-3.76 8.132q.114.23.14.492h-.776a.8.8 0 0 0-.097-.249.7.7 0 0 0-.17-.19.7.7 0 0 0-.237-.126 1 1 0 0 0-.299-.044q-.427 0-.665.302-.234.301-.234.85v.498q0 .351.097.615a.9.9 0 0 0 .304.413.87.87 0 0 0 .519.146 1 1 0 0 0 .457-.096.67.67 0 0 0 .272-.264q.09-.164.091-.363v-.255H8.82v-.59h1.576v.798q0 .29-.097.55a1.3 1.3 0 0 1-.293.458 1.4 1.4 0 0 1-.495.313q-.296.111-.697.111a2 2 0 0 1-.753-.132 1.45 1.45 0 0 1-.533-.377 1.6 1.6 0 0 1-.32-.58 2.5 2.5 0 0 1-.105-.745v-.506q0-.543.2-.95.201-.406.582-.633.384-.228.926-.228.357 0 .636.1.281.1.48.275.2.176.314.407Zm-8.64-.706H0v4h.791v-1.343h.803q.43 0 .732-.172.305-.177.463-.475a1.4 1.4 0 0 0 .161-.677q0-.374-.158-.677a1.2 1.2 0 0 0-.46-.477q-.3-.18-.732-.179m.545 1.333a.8.8 0 0 1-.085.381.57.57 0 0 1-.238.24.8.8 0 0 1-.375.082H.788v-1.406h.66q.327 0 .512.182.185.181.185.521m1.964 2.666V13.25h.032l1.761 2.675h.656v-3.999h-.75v2.66h-.032l-1.752-2.66h-.662v4z"/>
                    </svg>
                </div>

                <div className="ActionSaveItemText">
                    <p>Export as Png</p>
                </div>

            </div>


            <div className="ActionSaveItem">

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
        </>
    )
}
export default SaveMenu