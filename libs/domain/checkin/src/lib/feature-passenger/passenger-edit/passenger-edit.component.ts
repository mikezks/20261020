import { ChangeDetectionStrategy, Component, inject, input, numberAttribute, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { PassengerService } from '../../logic-passenger/data-access/passenger.service';
import { initialPassenger } from '../../logic-passenger/model/passenger';

// (3)

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- preserves the workshop's pre-v22 behavior
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-passenger-edit',
  imports: [
    // (4) UI Control: Template Binding
    FormField,
    RouterLink
  ],
  templateUrl: './passenger-edit.component.html'
})
export class PassengerEditComponent {
  private readonly passengerService = inject(PassengerService);

  // (1) Data Model: Writable Signal
  private readonly passenger = signal({
    ...initialPassenger,
    firstName: 'INIT'
  });
  // (2) Field State: valid, dirty, touched, value
  protected readonly editForm = form(this.passenger);

  protected id = input(0, { transform: numberAttribute });
  protected passengerResource = this.passengerService.findByIdAsResource(this.id);

  protected save(): void {
    console.log(this.passenger());
    console.log(this.editForm().value());
    console.log(this.passengerResource.value());
  }
}
