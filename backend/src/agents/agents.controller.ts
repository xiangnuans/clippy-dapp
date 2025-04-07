import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Put,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  async create(@Body() createAgentDto: CreateAgentDto, @Request() req) {
    return this.agentsService.create(createAgentDto, req.user);
  }

  @Get()
  async findAll(@Request() req) {
    return this.agentsService.findAll(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.agentsService.findOne(id, req.user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateAgentDto: UpdateAgentDto, 
    @Request() req
  ) {
    return this.agentsService.update(id, updateAgentDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.agentsService.remove(id, req.user);
  }
} 