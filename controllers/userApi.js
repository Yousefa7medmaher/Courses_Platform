import User from '../usermodel.js';

/**
 * Add a new user to the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function adduser(req, res, next) { 
    try { 
       const {name , email , password } = req.body ; 
       if (!name || !email || !password)  {
        res.status(400).send({
            mess : "enter all fields " 
            ,sucess : false 
        });
       }
       else { 
        const data = await User.create({name , email , password }); 
        res.status(200).send({
            mess : "user create sucessfully" ,
            sucess: true ,
            data : data 
        })
       }
    }
    catch (err) { 
        next(err);
    }
}
 
export { adduser , showAllUsers };
