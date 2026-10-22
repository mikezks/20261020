import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { Flight } from '../model/flight';
import { FlightFilter } from '../model/flight-filter';
import { pipe, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { FlightService } from '../data-access/flight.service';


export interface BookingState {
  filter: FlightFilter;
  basket: Record<number, boolean>;
  flights: Flight[];
}

export const initialBookingState: BookingState = {
  filter: {
    from: 'Hamburg',
    to: 'Graz',
    urgent: false
  },
  basket: {
    2: true,
    3: true,
    5: true
  },
  flights: [],
};


export const BookingStore = signalStore(
  { providedIn: 'root' },
  // State
  withState(initialBookingState),
  withComputed(store => ({
    delayed: () => store.flights().filter(flight => flight.delayed),
  })),
  // Updaters
  withMethods(store => ({
    setFilter: (filter: FlightFilter) => patchState(store, { filter }),
    setFlights: (flights: Flight[]) => patchState(store, { flights }),
    resetFlights: () => patchState(store, { flights: [] }),
  })),
  // Side-Effects
  withMethods((
    store,
    flightService = inject(FlightService)
  ) => ({
    load: rxMethod<FlightFilter>(pipe(
      switchMap(filter => flightService.find(
        filter.from, filter.to, filter.urgent
      ).pipe(
        tapResponse({
          next: flights => store.setFlights(flights),
          error: err => console.error(err)
        })
      ))
    )),
  })),
  withHooks(store => ({
    onInit: () => store.load(store.filter)
  }))
);
