import mongoose from 'mongoose'; 
const userSchema =  new mongoose.Schema({
    name : String , 
    email : String , 
    password : String ,
    age : Number 
}); 
const usermodel = mongoose.model('usermodel',userSchema)
export default usermodel; 
