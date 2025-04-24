import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenquizComponent } from './openquiz.component';

describe('OpenquizComponent', () => {
  let component: OpenquizComponent;
  let fixture: ComponentFixture<OpenquizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenquizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenquizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
