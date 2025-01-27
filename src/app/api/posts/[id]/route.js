import { NextResponse } from "next/server";
import connect from "../../../../../db"
import Canvas from "@models/Canvas";
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

export const PUT = async (request, { params }) => {
    try{
        console.log("Getting request data...");
        const { id } = await params;
        const { newImage: image } = await request.json();

        console.log("Connecting to database...");
        await connect();
    
        const result = await Canvas.findByIdAndUpdate(new ObjectId(id), { image }, { new: true, upsert: true });

        if (!result) {
            console.error("Post not found");
            return new NextResponse("Post not found", { status: 404 });
        }
      
        return NextResponse.json({ message: "Successfully updated post", data: result },{ status: 200 } );

    } catch(error){
        console.error("Error updating post:", error.message);
        return new NextResponse("Error updating post" + error.message, { status: 500 });
    }
}