import { ObjectId } from "mongodb";

export interface ISession {
  _id?: ObjectId;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionCreate {
  token: string;
  userId: string;
  expiresAt: Date;
}

export const SessionSchema = {
  name: "sessions",
  indexes: [
    { key: { token: 1 }, unique: true },
    { key: { userId: 1 } },
    { key: { expiresAt: 1 } },
  ],
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["token", "userId", "expiresAt", "createdAt", "updatedAt"],
      properties: {
        _id: { bsonType: "objectId" },
        token: { bsonType: "string" },
        userId: { bsonType: "string" },
        expiresAt: { bsonType: "date" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
};
