import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { QuestionType } from '../../enums/question-type.enum';

@Injectable()
export class QuestionTypeValidationPipe implements PipeTransform<any> {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata.type === 'body' && metadata.metatype) {
      const { questions } = value;

      if (questions && Array.isArray(questions)) {
        questions.forEach((question, index) => {
          const { type } = question;

          if (!Object.values(QuestionType).includes(type)) {
            throw new BadRequestException(`Invalid question type at index ${index}. Expected one of: ${Object.values(QuestionType).join(', ')}`);
          }
        });
      }
    }

    return value;
  }
}