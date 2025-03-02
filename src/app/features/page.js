"use client"
import { Link } from "lucide-react";
import "./../../styles/about.css";
import { useEffect, useState, useRef, use } from 'react'
import React from 'react';
import Navbar from "@/components/landing_page/navbar";
import { Roboto } from "next/font/google";
import { set } from "mongoose";


const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400","700"],
    variable: "--font-roboto",
})


const Page = () => {
    const scrollerRef = useRef(null)
    //Ref for checking if the user is loged in
    const logedIn = useRef(false)
    //State for checking if the screen is small
    const  [isSmallScreen, setIsSmallScreen] = useState(false)

    useEffect(() => {
        //Function for handling changes in the navbar
        function changeNavbar(){
            if(window.innerWidth < 768){
                setIsSmallScreen(true)
            }else{
                setIsSmallScreen(false)
            }
        }
        //Add event listener for resizing the window
        window.addEventListener('resize', changeNavbar)
        //Remove event listener when the component is unmounted
        return () => {
            window.removeEventListener('resize', changeNavbar)
        }
    }, [])



    return(
        <>
            <div className={`${roboto.className} Main ${roboto.variable}`}>
                <Navbar isSmallScreen={isSmallScreen} logedIn={logedIn.current}/>

                <div className="Content">




                    


                </div>
            </div>
        </>
    )
}
export default Page;