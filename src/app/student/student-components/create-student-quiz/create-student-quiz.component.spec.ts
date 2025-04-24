import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStudentQuizComponent } from './create-student-quiz.component';

describe('CreateStudentQuizComponent', () => {
  let component: CreateStudentQuizComponent;
  let fixture: ComponentFixture<CreateStudentQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateStudentQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateStudentQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
