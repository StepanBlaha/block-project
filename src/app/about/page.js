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

                    <div className="Hero">
                        <div className="HeroContent">

                            <div className="HeroCenter">
                                <div className="HeroTitle">
                                    <h2>Hero Title</h2>
                                </div>
                                <div className="HeroDescription">
                                    <p>Hero Description</p>
                                </div>
                                <div className="HeroButton"> 
                                    <p>Start drawing</p>
                                </div>  
                            </div>

                        </div>

                        <div className="HeroImage">

                            <div className="HeroScreen">
                                <div class="MockupFrame relative mx-auto border-neutral-900 dark:border-neutral-900 bg-neutral-900 border-[14px] rounded-[2.5rem] h-[454px] max-w-[341px] md:h-[682px] md:max-w-[512px]">
                                    <div class=" h-[32px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                                    <div class=" h-[46px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                                    <div class=" h-[46px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                                    <div class=" h-[64px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                                    <div class="screen-shadow rounded-[2rem] overflow-hidden h-[426px] md:h-[654px] bg-white dark:bg-neutral-900">
                                        <img src="/canvas_screen.png" class=" dark:hidden h-[426px] md:h-[654px]" alt=""/>
                                        <img src="/canvas_screen.png" class=" hidden dark:block h-[426px] md:h-[654px]" alt=""/>
                                    </div>
                                </div>

                                <div className="HeroPhone">
                                    <div class="relative mx-auto border-neutral-900 dark:border-neutral-900 bg-neutral-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]">
                                        <div class="h-[32px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                                        <div class="h-[46px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                                        <div class="h-[46px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                                        <div class="h-[64px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                                        <div class="screen-shadow  rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-neutral-900">
                                            <img src="/canvas_screen_phone.png" class="dark:hidden w-[272px] h-[572px]" alt=""/>
                                            <img src="/canvas_screen_phone.png" class="hidden dark:block w-[272px] h-[572px]" alt=""/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    {/*Techscroll section */}
                    <div className="TechScroll">
                    <div className="TechScrollBackgroundColor"></div>
                        <div className="TechScrollTitle">
                            <h2>Built with</h2>
                        </div>
                        <div className="TechScrollContent" ref={scrollerRef}>
                            <div className="TechScrollSection">
                                <div className="TechScrollItem item1">
                                    <img src="/node.svg" alt="Node js" />
                                </div>
                                <div className="TechScrollItem item2">
                                    <img src="/mongodb.svg" alt="Mongo db" />
                                </div>
                                <div className="TechScrollItem item3">
                                    <img src="/html.svg" alt="Html" />
                                </div>
                                <div className="TechScrollItem item4">
                                    <img src="/react.svg" alt="React" />
                                </div>
                                <div className="TechScrollItem item5">
                                    <img src="/nextjs.svg" alt="Next js" />
                                </div>
                                <div className="TechScrollItem item6">
                                    <img src="/npm.svg" alt="NPM" />
                                </div>
                                <div className="TechScrollItem item7">
                                    <img src="/tailwind.svg" alt="Tailwind" />
                                </div>
                                <div className="TechScrollItem item8">
                                    <img src="/github.svg" alt="Github" />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/*Feature section */}
                    <div className="Features">
                        <div className="FeatureBackgroundColor"></div>
                        <div className="FeatureGrid">

                            <div className="Feature Feature1">
                                <div className="FeatureLogo">
                                    <div className="FeatureLogoCube">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
                                    </div>
                                    <div className="FeatureTitle">
                                        <h3>Draw & Paint </h3>
                                    </div>
                                </div>
                                <div className="FeatureContent">
                                    <div className="FeatureText">
                                        <p>Unleash your creativity with freehand drawing, precise erasing, and the bucket fill tool. Customize your brush size and colors to bring your ideas to life effortlessly.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="Feature Feature2">
                                <div className="FeatureLogo">
                                    <div className="FeatureLogoCube">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-function"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"/><path d="M9 11.2h5.7"/></svg>
                                    </div>
                                    <div className="FeatureTitle">
                                        <h3>Smart Shapes & Text</h3>
                                    </div>
                                </div>
                                <div className="FeatureContent">
                                    <div className="FeatureText">
                                        <p>Create perfect shapes with ease, thanks to autofill support. Add text annotations directly on the canvas to make your designs more expressive and informative.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="Feature Feature3">
                                <div className="FeatureLogo">
                                    <div className="FeatureLogoCube">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-sparkles"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
                                        {/*
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
                                        */}
                                    </div>
                                    <div className="FeatureTitle">
                                        <h3>Flexible Editing</h3>
                                    </div>
                                </div>
                                <div className="FeatureContent">
                                    <div className="FeatureText">
                                        <p>Take full control of your artwork! Undo and redo actions, rotate the entire canvas, or delete it when you need a fresh start. Use the pipette tool to pick colors with precision.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="Feature Feature4">
                                <div className="FeatureLogo">
                                    <div className="FeatureLogoCube">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save-all"><path d="M10 2v3a1 1 0 0 0 1 1h5"/><path d="M18 18v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6"/><path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="M8 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9.172a2 2 0 0 1 1.414.586l2.828 2.828A2 2 0 0 1 22 6.828V16a2 2 0 0 1-2.01 2z"/></svg>
                                        {/*
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                        */}
                                    </div>
                                    <div className="FeatureTitle">
                                        <h3>Save & Share</h3>
                                    </div>
                                </div>
                                <div className="FeatureContent">
                                    <div className="FeatureText">
                                        <p>Store your work securely in the database or export it as a high-quality PNG or PDF. Easily save and share your creations anytime, anywhere.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                </div>
            </div>
        </>
    )
}
export default Page;