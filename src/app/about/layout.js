import { Geist, Geist_Mono } from "next/font/google";
import { Roboto } from "next/font/google";
import "./../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/appSidebar"

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400","700"],
    variable: "--font-roboto",
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {

  return (
  

    <html lang="en"  className="dark">
      <body
        className={`${roboto.variable} antialiased`}
      >
          
        <main>{children}</main>
          
      </body>
    </html>
  );
}
