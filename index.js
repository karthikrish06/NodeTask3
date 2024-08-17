import express from "express";
import cors from 'cors';
import DbClient from "./database/client-connectivity.js";
import adminRouter from "./routers/admin/admin.js";
import mentorRouter from "./routers/mentor/mentor.js";

const app = express();
await DbClient.connect();
app.use(express.json());
app.use(cors())
app.use('/admin',adminRouter)
app.use('/mentor',mentorRouter)

app.get('/', function (req, res) {
    res.send('<h4>Postman Pusblished Doc: <a href="https://documenter.getpostman.com/view/20660257/2s93zB4gBz" target="_blank">https://documenter.getpostman.com/view/20660257/2s93zB4gBz</a></h4>')
  })
  
  app.listen(5000)