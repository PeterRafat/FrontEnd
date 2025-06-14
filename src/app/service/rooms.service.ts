import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, switchMap, take, filter, map } from 'rxjs/operators';
import { timer } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';

export interface Room {
  id: string;
  name: string;
  teacherId: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  startAt: string;
  endAt: string;
  duration: number;
  roomId: string;
  status?: string;
  creationMethod?: 'manual' | 'ai';
  ai?: boolean;
}

export interface Question {
  id?: number;
  text: string;
  type: number;
  correctAnswer: string;
  quizId: number;
  options: QuestionOption[];
  explanation?: string;
}

export interface QuestionOption {
  text: string;
}

export interface QuizResult {
  score: number;
  studentId: string;
  quizId: number;
  completedAt?: string;
}

export interface QuizResultResponse {
  value: QuizResult;
  isSuccess: boolean;
  isFailure: boolean;
  error: {
    code: string;
    description: string;
    statusCode: number | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private roomsSubject = new BehaviorSubject<Room[]>([]);
  rooms$ = this.roomsSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  createRoom(name: string, teacherId: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(
      `${environment.baseurl}/api/Room`,
      { name, teacherId },
      { headers, responseType: 'text' as 'json' }
    ).pipe(
      tap(() => {
        // After creation, fetch the latest rooms
        this.getTeacherRooms(teacherId).subscribe();
      }),
      catchError(this.handleError)
    );
  }

  getTeacherRooms(teacherId: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${environment.baseurl}/api/Room/teacher/${teacherId}`)
      .pipe(
        tap(rooms => this.roomsSubject.next(rooms)),
        catchError(this.handleError)
      );
  }

  deleteRoom(roomId: string, teacherId: string): Observable<any> {
    return this.http.delete<any>(`${environment.baseurl}/api/Room/${roomId}/${teacherId}`, { responseType: 'text' as 'json' })
      .pipe(
        tap(() => {
          // After deletion, fetch the latest rooms
          this.getTeacherRooms(teacherId).subscribe();
        }),
        catchError(this.handleError)
      );
  }

  getQuizzesByRoom(roomId: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${environment.baseurl}/api/Quiz/by-room/${roomId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createQuiz(roomId: string, quizData: Partial<Quiz>): Observable<Quiz> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    console.log('Service: Creating quiz for roomId:', roomId);
    console.log('Service: Quiz data being sent:', quizData);
    console.log('Service: Full URL:', `${environment.baseurl}/api/Quiz/${roomId}`);
    
    return this.http.post<Quiz>(
      `${environment.baseurl}/api/Quiz/${roomId}`,
      quizData,
      { headers }
    ).pipe(
      tap(response => {
        console.log('Service: Quiz created successfully:', response);
      }),
      catchError(error => {
        console.error('Service: Error creating quiz:', error);
        return this.handleError(error);
      })
    );
  }

  deleteQuizFromRoom(quizId: number, roomId: string): Observable<any> {
    const url = `${environment.baseurl}/api/Quiz/${quizId}/remove-from-room/${roomId}`;
    return this.http.delete(url, { responseType: 'text' as 'json' }).pipe(
      catchError(this.handleError)
    );
  }

  editQuiz(quizId: string) {
    // Example: Navigate to an edit page (replace with your actual route)
    this.router.navigate(['/teacher/edit-quiz', quizId]);
    // Or open a modal, or whatever your logic is for editing/adding questions
  }

  getQuestionsByQuiz(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${environment.baseurl}/api/Question/quiz/${quizId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  addQuestions(questions: Question[]): Observable<any> {
    return this.http.post(`${environment.baseurl}/api/Question/AddAll`, questions, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      );
  }

  updateQuestion(questionId: number, question: Question): Observable<any> {
    return this.http.put(`${environment.baseurl}/api/Question/${questionId}`, question, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteQuestion(questionId: number): Observable<any> {
    return this.http.delete(`${environment.baseurl}/api/Question/${questionId}`, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      );
  }


  // Upload PDF and generate questions for a quiz (returns only the POST observable)
  generateQuestionsFromPDF(quizId: number, pdfFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    return this.http.post(`${environment.baseurl}/api/QuizGeneration/generate/${quizId}`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Uploads a PDF and then polls for the generated questions for the quiz.
   * Polls every 1s up to 10 times or until questions are found.
   */
  generateQuestionsFromPDFAndFetch(quizId: number, pdfFile: File): Observable<Question[]> {
    // This method chains the POST and then GET with polling
    // Only emits when questions are found (length > 0) or after 10 tries
    return this.generateQuestionsFromPDF(quizId, pdfFile).pipe(
      switchMap(() =>
        timer(0, 1000).pipe(
          take(10), // up to 10 tries (10 seconds)
          switchMap(() => this.getQuestionsByQuiz(quizId)),
          filter((questions: Question[]) => Array.isArray(questions)), // remove length > 0 to emit even if empty
          take(1)
        )
      ),
      catchError(this.handleError)
    );
  }

  // Student room management functions
  joinRoom(roomId: string, studentId: string): Observable<Room> {
    return this.http.post<Room>(
      `${environment.baseurl}/api/Room/student/${roomId}/${studentId}`,
      {}
    ).pipe(
      tap(room => {
        // Update the rooms list with the new room
        const currentRooms = this.roomsSubject.value;
        if (!currentRooms.some(r => r.id === room.id)) {
          this.roomsSubject.next([...currentRooms, room]);
        }
      }),
      catchError(this.handleError)
    );
  }

  getStudentRooms(studentId: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${environment.baseurl}/api/Room/student/${studentId}`)
      .pipe(
        tap(rooms => this.roomsSubject.next(rooms)),
        catchError(this.handleError)
      );
  }

  leaveRoom(roomId: string, studentId: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.baseurl}/api/Room/student/${roomId}/${studentId}`,
      { responseType: 'text' as 'json' }
    ).pipe(
      catchError(this.handleError)
    );
  }

  submitQuizResult(result: QuizResult): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(
      `${environment.baseurl}/api/Result`,
      {
        score: result.score,
        studentId: result.studentId,
        quizId: result.quizId
      },
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getQuizResult(quizId: number, studentId: string): Observable<QuizResult> {
    return this.http.get<QuizResultResponse>(`${environment.baseurl}/api/Result/${quizId}/${studentId}`)
      .pipe(
        map(response => response.value),
        catchError(this.handleError)
      );
  }

  // Student: Upload PDF and generate questions for a quiz
  generateQuestionsForStudent(quizId: number, pdfFile: File): Observable<{questions: Question[], message: string}> {
    if (!quizId || quizId <= 0) {
      console.error('Invalid quizId:', quizId);
      return throwError(() => new Error('Invalid quizId'));
    }

    if (!pdfFile || !(pdfFile instanceof File) || pdfFile.size === 0) {
      console.error('Invalid file:', pdfFile);
      return throwError(() => new Error('Invalid file'));
    }

    const formData = new FormData();
    formData.append('pdfFile', pdfFile); // Only use 'pdfFile'

    console.log('Sending request:', {
      url: `${environment.baseurl}/api/QuizGeneration/generate-for-student/${quizId}`,
      fileInfo: {
        name: pdfFile.name,
        type: pdfFile.type,
        size: pdfFile.size
      }
    });

    return this.http.post<{questions: Question[], message: string}>(
      `${environment.baseurl}/api/QuizGeneration/generate-for-student/${quizId}`,
      formData
    ).pipe(
      tap(response => {
        console.log('PDF upload response:', response);
      }),
      catchError(error => {
        let backendMsg = '';
        if (error.error) {
          if (typeof error.error === 'string') {
            backendMsg = error.error;
          } else if (typeof error.error === 'object') {
            backendMsg = JSON.stringify(error.error);
          }
        }
        console.error('PDF upload error:', {
          status: error.status,
          statusText: error.statusText,
          backendMsg,
          message: error.message
        });
        if (error.status === 400) {
          return throwError(() => new Error(`Bad Request: ${backendMsg || error.message}`));
        }
        return throwError(() => error);
      })
    );
  }

  // Student: Get generated questions for a quiz
  getStudentGeneratedQuestions(quizId: number): Observable<Question[]> {
    if (!quizId || quizId <= 0) {
      return throwError(() => new Error('Invalid quizId'));
    }
    return this.http.get<Question[]>(`${environment.baseurl}/api/QuizGeneration/student-generated-questions/${quizId}`)
      .pipe(
        tap(response => console.log('Get questions response:', response)),
        catchError(error => {
          console.error('Get questions error:', error);
          return throwError(() => error);
        })
      );
  }
}
