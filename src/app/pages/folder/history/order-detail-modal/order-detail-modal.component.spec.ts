import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrderDetailModalComponent } from './order-detail-modal.component';

describe('OrderDetailModalComponent', () => {
  let component: OrderDetailModalComponent;
  let fixture: ComponentFixture<OrderDetailModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OrderDetailModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
