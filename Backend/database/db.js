import mongoose from 'mongoose'

export const connectDb = async() =>{
    try{
        await mongoose.connect(process.env.MONGO_URL,{
            dbName: "MernSocial",
        })

        console.log("Mongodb connected")
    }catch(error){
        console.log(error)
    }
}