import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, numberAttribute } from '@angular/core';
import { apply, createMetadataKey, debounce, form, FormField, FormRoot, metadata, required, schema, SchemaPath, validate, validateHttp } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { Address, AddressControl, addressSchema, initialAddress } from '@flight-demo/shared/core';
import { PassengerService } from '../../logic-passenger/data-access/passenger.service';
import { Passenger } from '../../logic-passenger/model/passenger';


export const ALLOWED_NAMES = createMetadataKey<string[]>();

export function validateName(
  field: SchemaPath<string>,
  message: string
): void {
  validate(field, ({ value, state }) => {
    const allowedNames = state.metadata(ALLOWED_NAMES)?.() || [];
    return allowedNames.includes(value())
      ? null
      : {
        kind: 'forbiddenLastname',
        message
    };
  });
}

export function validateStatusAsync(
  field: SchemaPath<string>,
  url: string
): void {
  validateHttp(field, {
    request: ({ value }) => ({
      url,
      params: { status: value() }
    }),
    onSuccess: (
      response: {
        status: string
        valid: boolean;
      },
      { value }
    ) => response.valid
      ? null
      : {
        kind: 'statusNotAllowed',
        message: `
          The status ${ value() } is not correct. 
          Use ${ response.status } instead.
        `
      },
    onError: () => ({
      kind: 'serverError',
      message: 'Async validation failed.'
    })
  });
}

// (3) Field Logic: validation, conditional readonly, hidden, disabled, metadata
const passengerSchema = schema<Passenger & {
  address: Address
}>(passengerPath => {
  metadata(passengerPath.name, ALLOWED_NAMES, () => [
    'Smith', 'Johnson', 'Williams'
  ]);
  required(passengerPath.name, {
    message: 'Please enter a lastname - this field is mandatory.'
  });
  validateName(
    passengerPath.name,
    'This lastname is not allowed.'
  );
  validateStatusAsync(
    passengerPath.passengerStatus,
    './passenger.status.json'
  );
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

  protected allowedLastnames = computed(
    () => this.editForm.name().metadata(ALLOWED_NAMES)?.()?.join(', ') || ''
  );

  protected save(): void {
    console.log(this.editForm().value());
    console.log(this.passengerWithAddress());
    console.log(this.passengerResource.value());
  }
}
