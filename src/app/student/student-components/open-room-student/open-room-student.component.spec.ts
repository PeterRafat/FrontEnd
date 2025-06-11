import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenRoomStudentComponent } from './open-room-student.component';

describe('OpenRoomStudentComponent', () => {
  let component: OpenRoomStudentComponent;
  let fixture: ComponentFixture<OpenRoomStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenRoomStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenRoomStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
