'use client';
import Link from 'next/link'
const NavbarFull = () => {
    return(
        <>
        <div className="NavbarPages">
            <div className="NavbarPage">
                <p><a href="/home">Home</a></p>
            </div>
            <div className="NavbarPage">
                <p>About</p>
            </div>
            <div className="NavbarPage">
                <p><a href="/canvas">Canvas</a></p>
            </div>
            <div className="NavbarPage">
                <p><a href="/features">Features</a></p>
            </div>
        </div>
        </>
    )
}
export default NavbarFull;