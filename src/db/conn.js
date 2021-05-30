const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/MiniProject",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false      
})
.then(()=>{
    console.log("connection successful");
})
.catch(()=>{
    console.log("connection unsucessful");
});
