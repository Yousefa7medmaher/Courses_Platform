import multer from "multer";
import path  from "path" ; 


const storage = multer.diskStorage({
    //Destination and filename config 
    destination : function(req , file ,cb )  {
        cb(null , "uploads/") ; 
    } ,
    filename : function(req , file , cb )  { 
        const uniquename= Date.now() + path.extname(file.originalname);
        cb(null , uniquename);
    }
});

const upload = multer({storage}); 

export default upload ; 
