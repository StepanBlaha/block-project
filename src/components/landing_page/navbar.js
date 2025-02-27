'use client';
import NavbarFull from "@/components/landing_page/navbarFull";
import NavbarBurger from "@/components/landing_page/navbarBurger";


const Navbar = ({isSmallScreen, logedIn}) => {
    if(isSmallScreen ){
        console.log("small screen");
    }
    return(
        <>
            <div className="Navbar">
                <div className="NavbarContent">
                    <div className="NavbarLogo"></div>

                    <div className="NavbarPages">
                        {isSmallScreen ? <NavbarBurger /> : <NavbarFull />}
                    </div>

                    <div className="NavbarAuth">
                        <div className="NavbarAuthButton">
                            <p>Sign in</p>
                        </div>
                    </div>

                </div>

            </div>
        </>
    )
}
export default Navbar;