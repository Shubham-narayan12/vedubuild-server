import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
    full_name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
    },
    phone_number:{
        type: Number,
        required: true
    },
    subject:{
       type : String,
       required:true,
    },
    message:{
        type: String,
    }
})

const enquiryModel = mongoose.model("Enquirys" , enquirySchema);
export default enquiryModel;