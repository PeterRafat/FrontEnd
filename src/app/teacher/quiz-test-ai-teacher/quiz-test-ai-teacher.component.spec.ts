import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizTestAiTeacherComponent } from './quiz-test-ai-teacher.component';

describe('QuizTestAiTeacherComponent', () => {
  let component: QuizTestAiTeacherComponent;
  let fixture: ComponentFixture<QuizTestAiTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizTestAiTeacherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizTestAiTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
