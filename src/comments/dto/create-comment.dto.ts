import { IsNotEmpty } from 'class-validator';

import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
