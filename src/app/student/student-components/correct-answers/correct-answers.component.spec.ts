import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectAnswersComponent } from './correct-answers.component';

describe('CorrectAnswersComponent', () => {
  let component: CorrectAnswersComponent;
  let fixture: ComponentFixture<CorrectAnswersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorrectAnswersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrectAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
