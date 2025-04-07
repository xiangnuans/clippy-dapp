import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type AgentDocument = HydratedDocument<Agent>;

@Schema({ timestamps: true })
export class Agent {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ default: true })
  isActive: boolean;
  
  @Prop({ type: Number, min: 0, max: 100, default: null })
  score: number;
  
  @Prop({ type: String, default: null })
  feedback: string;
  
  @Prop({ type: Date, default: null })
  ratedAt: Date;
}

export const AgentSchema = SchemaFactory.createForClass(Agent); 