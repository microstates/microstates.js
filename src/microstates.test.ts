import 'jest';

import microstates from './microstates';
import * as getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

describe('microstates', () => {
  describe('arguments', () => {
    it('expects first argument to be a class', () => {
      expect(() => {
        microstates('Something');
      }).toThrowError(
        /microstates\(\) expects first argument to be a class, instead received string/
      );
    });
  });
  describe('primitives', () => {
    class State {
      string = String;
      number = Number;
      boolean = Boolean;
      array = Array;
      object = Object;
    }

    describe('state', () => {
      let { state } = microstates(State);
      describe('string', () => {
        it('is a string', () => {
          expect(typeof state.string).toEqual('string');
        });
        it('is empty', () => {
          expect(state.string).toBe('');
        });
      });
      describe('number', () => {
        it('is a number', () => {
          expect(typeof state.number).toEqual('number');
        });
        it('is zero', () => {
          expect(state.number).toBe(0);
        });
      });
      describe('boolean', () => {
        it('is a boolean', () => {
          expect(typeof state.boolean).toEqual('boolean');
        });
        it('is false', () => {
          expect(state.boolean).toBe(false);
        });
      });
      describe('array', () => {
        it('is a array', () => {
          expect(Array.isArray(state.array)).toBeTruthy();
        });
        it('is empty', () => {
          expect(state.array).toEqual([]);
        });
      });
      describe('object', () => {
        it('is a object', () => {
          expect(typeof state.object).toEqual('object');
        });
        it('is empty', () => {
          expect(state.object).toEqual({});
        });
      });
    });

    describe('initial', () => {
      let { state } = microstates(State, {
        string: 'abc',
        number: 10,
        boolean: true,
        array: ['a', 'b', 'c'],
        object: { hello: 'world' },
      });
      it('uses initial value provided', () => {
        expect(state).toEqual({
          string: 'abc',
          number: 10,
          boolean: true,
          array: ['a', 'b', 'c'],
          object: { hello: 'world' },
        });
      });
    });

    describe('actions', () => {
      let { actions } = microstates(State);
      describe('string', () => {
        it('is an object', () => {
          expect(actions.string).toBeInstanceOf(Object);
        });
        it('has concat', () => {
          expect(typeof actions.string.concat).toEqual('function');
        });
      });
      describe('number', () => {
        it('is an object', () => {
          expect(actions.number).toBeInstanceOf(Object);
        });
        it('has increment', () => {
          expect(typeof actions.number.increment).toEqual('function');
        });
        it('has decrement', () => {
          expect(typeof actions.number.decrement).toEqual('function');
        });
        it('has sum', () => {
          expect(typeof actions.number.sum).toEqual('function');
        });
        it('has subtract', () => {
          expect(typeof actions.number.subtract).toEqual('function');
        });
      });
      describe('boolean', () => {
        it('is an object', () => {
          expect(actions.boolean).toBeInstanceOf(Object);
        });
        it('has toggle', () => {
          expect(typeof actions.boolean.toggle).toEqual('function');
        });
      });
      describe('object', () => {
        it('is an object', () => {
          expect(actions.object).toBeInstanceOf(Object);
        });
        it('has assign', () => {
          expect(typeof actions.object.assign).toEqual('function');
        });
      });
      describe('array', () => {
        it('is an array', () => {
          expect(actions.array).toBeInstanceOf(Object);
        });
        it('has push', () => {
          expect(typeof actions.array.push).toEqual('function');
        });
      });
    });
  });
  describe('composition', () => {
    class Session {
      token = String;
    }
    class User {
      firstName = String;
      lastName = String;
      age = Number;
    }
    class Authentication {
      session = Session;
      user = User;
      isAuthenticated = Boolean;
    }
    class State {
      authentication = Authentication;
    }
    describe('state', () => {
      it('decends into composed states', () => {
        let { state } = microstates(State);
        expect(state).toEqual({
          authentication: {
            session: {
              token: '',
            },
            user: {
              firstName: '',
              lastName: '',
              age: 0,
            },
            isAuthenticated: false,
          },
        });
      });
      it('restores state', () => {
        let { state } = microstates(State, {
          authentication: {
            isAuthenticated: true,
            session: {
              token: 'VERY SECRET',
            },
            user: {
              firstName: 'Taras',
              lastName: 'Mankovski',
              age: 35,
            },
          },
        });
        expect(state).toEqual({
          authentication: {
            isAuthenticated: true,
            session: {
              token: 'VERY SECRET',
            },
            user: {
              firstName: 'Taras',
              lastName: 'Mankovski',
              age: 35,
            },
          },
        });
      });
    });
  });
});
