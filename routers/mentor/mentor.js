import express from "express";
import {
    findAllWithQuery
  } from '../../database/db-utils.js'

const mentorRouter = express.Router();

mentorRouter.get('/getStudents',async (req, res) => {
    const {id} = req.query;
    console.log(id)    
    await findAllWithQuery('mentors',id, "GetStudentsWithMentorID").then((msg) => msg.length === 0 ? res.status(400).send({msg: "Incorrect Mentor Id!"}):res.send(msg))
})


export default mentorRouter;