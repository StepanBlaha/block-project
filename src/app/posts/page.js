
'use client'
import Image from "next/image";
import "./../styles/canvas.css";
import { useEffect, useState, useRef } from 'react'
import React from "react";
import { document } from "postcss";
import { notFound } from "next/navigation";



async function getData() {
  const res = await fetch("http://localhost:3000/api/posts", {cache: "no-store"});
  if (!res.ok) {
    console.error("Failed to fetch data from the server");
    return notFound();
  }
  return await res.json();

}

const Home = async ()=> {
    



  return (
    <>
      <div className="Main">
        

      </div>

    </>
  );
}
export default Home;
