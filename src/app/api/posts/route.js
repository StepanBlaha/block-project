import { NextResponse } from "next/server";
import connect from "../../../../db"
import Post from "../../../../models/Post"
import Canvas from "../../../../models/Canvas";
import mongoose from 'mongoose';

export const  GET = async (request) => {
    console.log("Handling api request");
    try {
        console.log("Connecting to database...");
        await connect();
        const posts = await Canvas.find();
        console.log("Successfully connected to the database");

        console.log("Successfully fetched posts");
        return new NextResponse(JSON.stringify(posts), { status: 200 });
    } catch (error) {
        console.error("Error in fetching posts:", error.message);
        return new NextResponse("Error in fetching posts" + error.message, { status: 500 });
        
    }

}

export const POST = async (request) => {
    try {
        console.log("Getting request data...");
        const {image, date} = await request.json();
        console.log("Connecting to database...");
        await connect();
        console.log("Creating database post...");
        await Canvas.create({image, date});

        console.log("Post created successfully");
        return NextResponse.json({ message: "Post created successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error creating post:", error.message);
        return new NextResponse("Error creating post" + error.message, { status: 500 });
    }
    
}