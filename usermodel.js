import mongoose from 'mongoose'; 
const Schema = mongoose.Schema; 

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    created_at: Date,
    updated_at: Date
}); 

export default mongoose.model('User', userSchema);