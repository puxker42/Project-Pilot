const Control = require('../models/Controls');

exports.updateControls = async (req, res) => {
   try{
    const {createProject, createUser} = req.body;
    const controls = await Control.find();
    if(!controls)
    {
        const newCtrl = {createProject, createUser};
        const newControl = await Control.create(newCtrl);   
    }else{
        controls[0].createProject = createProject;
        controls[0].createUser = createUser;
        await controls[0].save();
    }
    return res.status(200).json({
        success:true,
        message:"Data Updated Successfully !"
    });
   }catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"Data Updation Failed !"
        });
   } 
};

exports.getControls = async (req, res) => {
    try{
        const controls = await Control.find();
        return res.status(200).json({
            success:true, 
            data:controls
        });
    }catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error
        });
    }
};