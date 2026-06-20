import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalCheckout } from './rental-checkout';

describe('RentalCheckout', () => {
  let component: RentalCheckout;
  let fixture: ComponentFixture<RentalCheckout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalCheckout],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalCheckout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
