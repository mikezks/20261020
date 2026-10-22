import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { form, FormField, required, schema } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { PassengerService } from '../../logic-passenger/data-access/passenger.service';
import { Passenger } from '../../logic-passenger/model/passenger';


// (3) Field Logic: validation, conditional readonly, hidden, disabled, metadata
const passengerSchema = schema<Passenger>(passengerPath => {
  required(passengerPath.name, {
    message: 'Please enter a lastname - this field is mandatory.'
  });
});


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
  
  protected id = input(0, { transform: numberAttribute });

  // (1) Data Model: Writable Signal
  protected passengerResource = this.passengerService.findByIdAsResource(this.id);

  // (2) Field State: valid, dirty, touched, value
  protected readonly editForm = form(this.passengerResource.value, passengerSchema);

  protected save(): void {
    console.log(this.editForm().value());
    console.log(this.passengerResource.value());
  }
}
