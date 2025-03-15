export interface IquizStudentDetails {
    quizName: string;
    startTime: string;
    endTime: string;
    difficultyLevel: string;
    duration: number | null;
    files: File[]; // Store uploaded PDF files
  }
