import express from "express";
import {
  readOneEntity,
  createEntity,
  updateOneEntity,
  updateManyEntity,
} from "../../database/db-utils.js";

const adminRouter = express.Router();

adminRouter.post("/createStudent", async (req, res) => {
  const { body } = req;
  const studObj = { ...body, history: [] };
  await createEntity("students", studObj).then((msg) =>
    msg.acknowledged
      ? res.send({ msg: "Student created successfully" })
      : res.status(400).send({ msg: "Unable to register" })
  );
});

adminRouter.post("/createMentor", async (req, res) => {
  const { body } = req;
  const mentorObj = { ...body, history: [] };
  await createEntity("mentors", mentorObj).then((msg) =>
    msg.acknowledged
      ? res.send({ msg: "Mentor created successfully" })
      : res.status(400).send({ msg: "Unable to register" })
  );
});

adminRouter.post("/createBatch", async (req, res) => {
  const { body } = req;
  const batchObj = { ...body, history: [] };
  await createEntity("batches", batchObj).then((msg) =>
    msg.acknowledged
      ? res.send({ msg: "Batch created successfully" })
      : res.status(400).send({ msg: "Unable to register" })
  );
});

adminRouter.put("/assignStudents", async (req, res) => {
  const { body: updateObj } = req;
  //console.log(updateObj)
  const msg = await updateOneEntity(
    "mentors",
    updateObj.mentorId,
    updateObj.students
  )
    .then(
      await updateManyEntity("students", updateObj.students, updateObj.mentorId)
    )
    .then((msg) =>
      msg.acknowledged && msg.modifiedCount > 0
        ? res.send({ msg: "Data updated successfully" })
        : res.status(400).send({ msg: "Data update failed!" })
    );
  console.log(msg);
});

adminRouter.put("/assignMentorToStudent", async (req, res) => {
  const { body: updateObj } = req;
  //Read the student object - current
  const currentStudObj = await readOneEntity("students", updateObj.studentId);
  //Read the current mentor object of the student
  const mentorObj = await readOneEntity("mentors", currentStudObj.mentor);
  //if any of the return is null, User not found!
  if (currentStudObj === null || mentorObj === null) {
    res.status(400).send({ msg: "Data update failed!" });
  } else { //assign the current mentor to history of the student obj
    const updatedHistory =
      currentStudObj.history.length <= 0
        ? [{ mentor: currentStudObj.mentor }]
        : [...currentStudObj.history, { mentor: currentStudObj.mentor }];
    //assign the current student to history of the current mentor obj
    const updatedMentor = {
      ...mentorObj,
      students: mentorObj.students.filter(
        (student) => student !== updateObj.studentId
      ),
      history: [
        ...mentorObj.history,
        {
          students: mentorObj.students.filter(
            (student) => student === updateObj.studentId
          ),
        },
      ],
    };
    
    await updateOneEntity(
      "students",
      updateObj.studentId,
      updateObj.mentor,
      updatedHistory
    )
      .then(async function (msg) {
        if (msg.acknowledged && msg.modifiedCount > 0) {
          return await updateOneEntity(
            "mentors",
            mentorObj.id,
            updatedMentor,
            true
          ).then(
            await updateOneEntity(
              "mentors",
              updateObj.mentor,
              [updateObj.studentId]
            )
          );
        } else {
          res.status(400).send({ msg: "Data update failed!" });
        }
      })
      .then((msg) =>
        msg.acknowledged && msg.modifiedCount > 0
          ? res.send({ msg: "Data updated successfully" })
          : res.status(400).send({ msg: "Data update failed!" })
      );
  }
});

adminRouter.get("/getHistory", async (req, res) => {
  const { id } = req.query;
  await readOneEntity("students", id).then((msg) =>
    msg === null
      ? res.status(400).send({ msg: "Incorrect Id!" })
      : res.send({ history: msg.history })
  );
});

export default adminRouter;
