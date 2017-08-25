import ComputedProperty from './ComputedProperty';
import { IAttributeOverrides } from '../Interfaces';

export default function defineComputedProperty(
  object: Object,
  name: string,
  callback: () => any,
  attributes: IAttributeOverrides
) {
  Object.defineProperty(object, name, new ComputedProperty(callback, attributes));
}