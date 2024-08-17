import { ObjectId } from "mongodb";

import DbClient from "./client-connectivity.js";

const DB_NAME = "assign-mentor";

// GET All entity name
const readAll = async (entityName) => {
  return await DbClient.db(DB_NAME)
    .collection(entityName)
    .find(
      {},
      {
        projection: {
          _id: 0,
        },
      }
    )
    .toArray();
};

// GET One Entity --> READ One
const readOneEntity = async (entityName, entityId) => {
  return await DbClient.db(DB_NAME)
    .collection(entityName)
    .findOne(
      { id: entityId },
      {
        projection: {
          _id: 0,
        },
      }
    );
};

// create --> CREATE
const createEntity = async (entityName, entityObj) => {
  //console.log(entityObj);
  return await DbClient.db(DB_NAME)
    .collection(entityName)
    .insertOne({
      ...entityObj,
      id: new ObjectId().toString(),
      registered_at: new Date(),
    });
};

// update one entity --> PUT
const updateOneEntity = async (entityName, entityId, entityObj, history) => {
  const query = entityName === 'mentors' && history ? {$set: entityObj} : entityName === 'mentors' ?
    { $push: { students: { $each: entityObj } } } 
    : 
    [{$set: { mentor:entityObj, history: history} }]
   return await DbClient.db(DB_NAME)
    .collection(entityName)
    .updateOne({ id: entityId }, query);
};

// update many entity --> PUT
const updateManyEntity = async (entityName, entityIds, entityObj) => {
  return await DbClient.db(DB_NAME)
    .collection(entityName)
    .updateMany({ id: { $in: entityIds } }, { $set: { mentor: entityObj } });
};

const deleteEntity = async (entityName, entityId) => {
  return await DbClient.db(DB_NAME)
    .collection(entityName)
    .deleteOne({ id: entityId });
};

const findAllWithQuery = async (entityName, entityId, actionType) => {
    const pipeline = actionType === 'GetStudentsWithMentorID' ? [
        {
            '$match': {
              'id': entityId
            }
        },
        {
          '$project': {
            'id': 1, 
            'userName': 1, 
            'students': 1, 
            '_id': 0
          }
        }, {
          '$unwind': {
            'path': '$students'
          }
        }, {
          '$lookup': {
            'from': 'students', 
            'localField': 'students', 
            'foreignField': 'id', 
            'as': 'students'
          }
        }, {
          '$unwind': {
            'path': '$students'
          }
        }, {
          '$group': {
            '_id': '$userName', 
            'students': {
              '$push': '$students.userName'
            }
          }
        }
      ]:''
    return await DbClient.db(DB_NAME).collection(entityName).aggregate(pipeline).toArray();
}

export {
  readAll,
  readOneEntity,
  createEntity,
  updateOneEntity,
  updateManyEntity,
  deleteEntity,
  findAllWithQuery,
};
