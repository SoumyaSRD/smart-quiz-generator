import { apiClient } from '../api/apiClient';
import type { Question, QuizConfig } from '../store/useQuizStore';

export interface QuizResponse {
  questions: Question[];
  config: QuizConfig;
}

export const quizService = {
  generateQuiz: async (formData: FormData): Promise<QuizResponse> => {
    return apiClient.post<QuizResponse>('/api/upload-and-generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
