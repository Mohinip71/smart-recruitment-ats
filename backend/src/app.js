const express=require('express');

const app=express();

app.get("/",(req,res) =>{
    res.json({
        message: "Smart ATS backend is running"
    })
})

module.exports=app;
