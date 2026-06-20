import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalCheckin } from './rental-checkin';

describe('RentalCheckin', () => {
  let component: RentalCheckin;
  let fixture: ComponentFixture<RentalCheckin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalCheckin],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalCheckin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
