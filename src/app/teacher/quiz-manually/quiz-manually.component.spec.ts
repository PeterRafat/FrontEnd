import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizManuallyComponent } from './quiz-manually.component';

describe('QuizManuallyComponent', () => {
  let component: QuizManuallyComponent;
  let fixture: ComponentFixture<QuizManuallyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizManuallyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizManuallyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
