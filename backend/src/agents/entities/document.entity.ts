import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Agent } from './agent.entity';

export type DocumentDocument = HydratedDocument<Document>;

export enum DocumentType {
  PDF = 'pdf',
  JPG = 'jpg',
  PNG = 'png',
  GIF = 'gif',
  MOV = 'mov',
  MP4 = 'mp4',
}

@Schema({ timestamps: true })
export class Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ required: true, enum: DocumentType })
  fileType: DocumentType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent', required: true })
  agent: Agent;
}

export const DocumentSchema = SchemaFactory.createForClass(Document); 