import mongoose from 'mongoose';
import { title } from 'process';

const { Schema } = mongoose;
const canvasSchema = new Schema({
    image: {
        type: String, 
        required: true, 
      },
      date: {
        type: Date,
        default: Date.now(),
      }

}, { timestamps: true });

const Canvas = mongoose.models.Canvas || mongoose.model("Canvas", canvasSchema);

export default Canvas;