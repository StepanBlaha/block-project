import mongoose from 'mongoose';
import { title } from 'process';

const { Schema } = mongoose;
const postSchema = new Schema({
    title:  { 
        type: String, 
        required: true
    },
    description: { 
        type: String, 
        required: true
    } 

}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;
/*import mongoose from 'mongoose';

const { Schema } = mongoose;

const postSchema = new Schema({
    title:  { 
        type: String, 
        required: true
    },
    description: { 
        type: String, 
        required: true
    } 

}, { timestamps: true });

export default mongoose.model('Post', postSchema); */