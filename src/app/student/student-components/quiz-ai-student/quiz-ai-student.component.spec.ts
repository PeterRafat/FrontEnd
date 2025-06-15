import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizAiStudentComponent } from './quiz-ai-student.component';

describe('QuizAiStudentComponent', () => {
  let component: QuizAiStudentComponent;
  let fixture: ComponentFixture<QuizAiStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizAiStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizAiStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
