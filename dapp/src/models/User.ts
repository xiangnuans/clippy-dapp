import { ObjectId } from "mongodb";

export interface IUser {
  _id?: ObjectId;
  walletAddress: string;
  username?: string;
  email?: string;
  avatar?: string;
  isActive: boolean;
  nonce: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  walletAddress: string;
  username?: string;
  email?: string;
  avatar?: string;
  nonce: string;
}

export const UserSchema = {
  name: "users",
  indexes: [
    { key: { walletAddress: 1 }, unique: true },
    { key: { email: 1 }, unique: true, sparse: true },
    { key: { nonce: 1 } },
  ],
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "walletAddress",
        "nonce",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        walletAddress: { bsonType: "string" },
        username: { bsonType: "string" },
        email: { bsonType: "string" },
        avatar: { bsonType: "string" },
        isActive: { bsonType: "bool" },
        nonce: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
};
