import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { QuestionType } from '../../enums/question-type.enum';

@Injectable()
export class QuestionTypeValidationPipe implements PipeTransform<any> {
  transform(value: any, metadata: ArgumentMetadata): any {
    console.log('QuestionTypeValidationPipe transform method called');
    console.log('metadata.type:', metadata.type);
    console.log('metadata.metatype:', metadata.metatype);

    if (metadata.type === 'body' && metadata.metatype) {
      const { questions } = value;
      console.log('questions:', questions);

      if (questions && Array.isArray(questions)) {
        questions.forEach((question, index) => {
          const { type } = question;
          console.log(`question ${index} type:`, type);

          if (!Object.values(QuestionType).includes(type)) {
            throw new BadRequestException(`Invalid question type at index ${index}. Expected one of: ${Object.values(QuestionType).join(', ')}`);
          }
        });
      }
    }

    return value;
  }
}