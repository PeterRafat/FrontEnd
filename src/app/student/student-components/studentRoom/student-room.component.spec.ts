import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRoomComponent } from './student-room.component';

describe('StudentRoomComponent', () => {
  let component: StudentRoomComponent;
  let fixture: ComponentFixture<StudentRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
