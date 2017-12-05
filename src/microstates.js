import { map, append } from 'funcadelic';

import Microstate from './utils/microstate';

/**
 * Invoking microstate will return an object with the following shape.
 *
 * {
 *  Type,                     // structure of current microstate
 *  value,                    // initial value
 *  valueOf() {               // initial value
 *    return value;
 *  }
 *
 *  // General use API
 *  states,                   // instantiated states
 *  ...transitions.collapsed  // spread collapsed transitions for chaining
 *
 *  // Customization API
 *  transitions,              // uncollapsed transitions tree
 * }
 *
 * @param {*} Type
 * @param {*} value
 */
export default function microstate(Type, value) {
  let microstate = new Microstate(Type, value);
  let properties = append(
    {
      microstate,
      get states() {
        return microstate.states.collapsed;
      },
    },
    microstate.transitions.collapsed
  );
  return append(microstate, properties);
}
