import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestQuizComponent } from './test-quiz.component';

describe('TestQuizComponent', () => {
  let component: TestQuizComponent;
  let fixture: ComponentFixture<TestQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
