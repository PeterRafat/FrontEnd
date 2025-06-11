import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizExamStudentComponent } from './quiz-exam-student.component';

describe('QuizExamStudentComponent', () => {
  let component: QuizExamStudentComponent;
  let fixture: ComponentFixture<QuizExamStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizExamStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizExamStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
