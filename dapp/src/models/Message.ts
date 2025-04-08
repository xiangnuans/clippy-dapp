import { ObjectId } from "mongodb";

export interface IMessage {
  _id?: ObjectId;
  content: string;
  role: "user" | "assistant" | "system";
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageCreate {
  content: string;
  role: "user" | "assistant" | "system";
  conversationId: string;
}

export const MessageSchema = {
  name: "messages",
  indexes: [{ key: { conversationId: 1 } }, { key: { createdAt: 1 } }],
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["content", "role", "conversationId", "createdAt", "updatedAt"],
      properties: {
        _id: { bsonType: "objectId" },
        content: { bsonType: "string" },
        role: { bsonType: "string", enum: ["user", "assistant", "system"] },
        conversationId: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
};
