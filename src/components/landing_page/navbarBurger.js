'use client';
import React, { useEffect } from 'react';
import {useState, useRef} from 'react';
import 'flowbite';
import "./../../styles/about.css";

const NavbarBurger = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    //Function for toggling menu
    function toggleMenu(){
        setIsMenuOpen(!isMenuOpen);
    }

    useEffect(() => {
        //Function for handling clicking outside of menu
        function handleClickOutside(event){
            if(menuRef.current && !menuRef.current.contains(event.target) ){
                console.log("mniai")
                setIsMenuOpen(false);
            }
        }
        //Add and remove event listener to document
        if(isMenuOpen){
            document.addEventListener('click', handleClickOutside);
        }
        return () =>{
            document.removeEventListener('click', handleClickOutside);
        }
        
    }, [isMenuOpen]);
    return(
        <>
        <div className='NavbarMenu'>
            <div className="relative inline-block text-left">
                <div>
                    <button onClick={toggleMenu} type="button" className="BurgerMenuButton inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50" id="menu-button" aria-expanded="true" aria-haspopup="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu size-8"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                    </button>
                </div>
            {isMenuOpen &&(
                <div ref={menuRef} className="BurgerMenuMenu absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
                    <div className="py-1" role="none">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="menu-item-0">Account settings</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="menu-item-1">Support</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="menu-item-2">License</a>
                        <form method="POST" action="#" role="none">
                            <button type="submit" className="block w-full px-4 py-2 text-left text-sm text-gray-700" role="menuitem" tabIndex="-1" id="menu-item-3">Sign out</button>
                        </form>
                    </div>
                </div>
                )}
            </div>
        </div>

        </>
    )
}
export default NavbarBurger;