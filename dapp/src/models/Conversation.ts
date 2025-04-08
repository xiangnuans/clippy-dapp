import { ObjectId } from "mongodb";

export interface IConversation {
  _id?: ObjectId;
  title?: string;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversationCreate {
  title?: string;
  agentId: string;
}

export const ConversationSchema = {
  name: "conversations",
  indexes: [{ key: { agentId: 1 } }, { key: { createdAt: -1 } }],
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["agentId", "createdAt", "updatedAt"],
      properties: {
        _id: { bsonType: "objectId" },
        title: { bsonType: "string" },
        agentId: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
};
