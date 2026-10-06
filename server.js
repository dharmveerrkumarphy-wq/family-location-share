require("dotenv").config();
const express=require("express");
const path=require("path");
const {nanoid}=require("nanoid");
const twilio=require("twilio");

const app=express();
app.use(express.json({limit:"20kb"}));
app.use(express.static(path.join(__dirname,"public")));

const requests=new Map();
const client=(process.env.TWILIO_ACCOUNT_SID&&process.env.TWILIO_AUTH_TOKEN)
 ? twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN):null;

app.post("/api/request",async(req,res)=>{
  const {phone}=req.body||{};
  if(!phone || !/^\+?[1-9]\d{7,14}$/.test(phone))
    return res.status(400).json({error:"Valid international phone number required."});
  const id=nanoid(24);
  requests.set(id,{phone,status:"pending",location:null,createdAt:Date.now()});
  const link=`${process.env.BASE_URL}/share.html?id=${id}`;
  if(!client) return res.status(503).json({error:"SMS service is not configured. Add Twilio credentials in .env.",link});
  try{
    await client.messages.create({
      body:`Location sharing request: ${link}\nOpen the link only if you know and trust the requester. Location is shared only after you tap Allow.`,
      from:process.env.TWILIO_PHONE_NUMBER,to:phone
    });
    res.json({ok:true,id});
  }catch(e){requests.delete(id);res.status(502).json({error:"SMS could not be sent."});}
});

app.get("/api/request/:id",(req,res)=>{
  const r=requests.get(req.params.id);
  if(!r)return res.status(404).json({error:"Request expired or not found."});
  res.json({status:r.status,location:r.location});
});

app.post("/api/request/:id/location",(req,res)=>{
  const r=requests.get(req.params.id);
  if(!r)return res.status(404).json({error:"Request not found."});
  const {lat,lon,accuracy}=req.body||{};
  if(typeof lat!=="number"||typeof lon!=="number")
    return res.status(400).json({error:"Invalid coordinates."});
  r.location={lat,lon,accuracy:Number(accuracy)||null,updatedAt:Date.now()};
  r.status="sharing";
  res.json({ok:true});
});

app.post("/api/request/:id/stop",(req,res)=>{
  const r=requests.get(req.params.id);
  if(!r)return res.status(404).json({error:"Request not found."});
  r.status="stopped"; r.location=null;
  res.json({ok:true});
});

app.get("/requester.html",(req,res)=>res.sendFile(path.join(__dirname,"public/requester.html")));
app.get("/share.html",(req,res)=>res.sendFile(path.join(__dirname,"public/share.html")));

app.listen(process.env.PORT||3000,()=>console.log("Server running"));
