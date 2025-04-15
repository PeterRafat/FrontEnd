import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentQuizesComponent } from './student-quizes.component';

describe('StudentQuizesComponent', () => {
  let component: StudentQuizesComponent;
  let fixture: ComponentFixture<StudentQuizesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentQuizesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentQuizesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
