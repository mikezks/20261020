import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, numberAttribute } from '@angular/core';
import { apply, debounce, form, FormField, FormRoot, required, schema, SchemaPath, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { Address, AddressControl, addressSchema, initialAddress } from '@flight-demo/shared/core';
import { PassengerService } from '../../logic-passenger/data-access/passenger.service';
import { Passenger } from '../../logic-passenger/model/passenger';


export function validateName(
  field: SchemaPath<string>,
  allowedNames: string[],
  message: string
): void {
  validate(field, ({ value }) =>
    allowedNames.includes(value())
      ? null
      : {
        kind: 'forbiddenLastname',
        message: message
          + ' Please use one of the following: '
          + allowedNames.join(', ')
      }
  );
}

// (3) Field Logic: validation, conditional readonly, hidden, disabled, metadata
const passengerSchema = schema<Passenger & {
  address: Address
}>(passengerPath => {
  required(passengerPath.name, {
    message: 'Please enter a lastname - this field is mandatory.'
  });
  validateName(passengerPath.name, [
    'Smith', 'Johnson', 'Williams'
  ], 'This lastname is not allowed.');
  debounce(passengerPath, 'blur');
  apply(passengerPath.address, addressSchema);
});


@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- preserves the workshop's pre-v22 behavior
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-passenger-edit',
  imports: [
    // (4) UI Control: Template Binding
    FormField, FormRoot,
    RouterLink,
    AddressControl
  ],
  templateUrl: './passenger-edit.component.html'
})
export class PassengerEditComponent {
  private readonly passengerService = inject(PassengerService);
  
  protected id = input(0, { transform: numberAttribute });

  // (1) Data Model: Writable Signal
  protected passengerResource = this.passengerService.findByIdAsResource(this.id);
  private passengerWithAddress = linkedSignal(() => ({
    ...this.passengerResource.value(),
    address: initialAddress
  }));

  // (2) Field State: valid, dirty, touched, value
  protected readonly editForm = form(
    this.passengerWithAddress,
    passengerSchema,
    { submission: { action: async () => this.save() }}
  );

  protected save(): void {
    console.log(this.editForm().value());
    console.log(this.passengerWithAddress());
    console.log(this.passengerResource.value());
  }
}
