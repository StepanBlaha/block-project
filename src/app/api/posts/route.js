import { NextResponse } from "next/server";
import connect from "../../../../db"
import Post from "../../../../models/Post"
import Canvas from "../../../../models/Canvas";

export const  GET = async (request) => {
    console.log("Handling api request");
    try {
        console.log("Connecting to database...");
        await connect();
        const posts = await Canvas.find();
        console.log("Successfully connected to the database");

        return new NextResponse(JSON.stringify(posts), { status: 200 });
    } catch (error) {
        console.error("Error in fetching posts:", error.message);
        return new NextResponse("Error in fetching posts" + error.message, { status: 500 });
        
    }

}

export const POST = async (request) => {
    const {image, date} = await request.json();
    await connect();
    await Canvas.create({image, date});
    return NextResponse.json({ message: "Post created successfully" }, { status: 201 });
}