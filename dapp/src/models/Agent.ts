import { ObjectId } from "mongodb";

export interface IAgent {
  _id?: ObjectId;
  name: string;
  industry: string;
  description: string;
  avatar?: string;
  isActive: boolean;
  score?: number;
  feedback?: string;
  ratedAt?: Date;
  ownerId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAgentCreate {
  name: string;
  industry: string;
  description: string;
  avatar?: string;
  ownerId: string;
  userId: string;
}

export const AgentSchema = {
  name: "agents",
  indexes: [
    { key: { ownerId: 1 } },
    { key: { userId: 1 } },
    { key: { createdAt: -1 } },
  ],
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "name",
        "industry",
        "description",
        "ownerId",
        "userId",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        industry: { bsonType: "string" },
        description: { bsonType: "string" },
        avatar: { bsonType: "string" },
        isActive: { bsonType: "bool" },
        score: { bsonType: "int" },
        feedback: { bsonType: "string" },
        ratedAt: { bsonType: "date" },
        ownerId: { bsonType: "string" },
        userId: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
};
