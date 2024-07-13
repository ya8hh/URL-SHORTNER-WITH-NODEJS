const express = require("express");
const app = express();
const urlRoute = require('./routes/url');
const {connectToMongoDB} =require('./connect');
const URL= require('./models/url')

const PORT =8001;

connectToMongoDB('mongodb://localhost:27017/short-url')
.then(()=>console.log('mongoDB connected'));
app.use(express.json());
app.use("/url",urlRoute);
//get for user
app.get('/:shortId', async (req,res)=>{
    const shortId = req.params.shortId;
     const entry= await URL.findOneAndUpdate({
        shortId
     },{$push:{
            visitHistory: {
                timestamp:Date.now(),
            },
     },
    
            }
    );
     res.redirect(entry.redirectUrl);
});

app.listen(PORT,()=>console.log(`Server Started at PORT ${PORT}`));
