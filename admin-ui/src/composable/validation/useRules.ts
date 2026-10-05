import { helpers, required,
  requiredIf,
  requiredUnless,
  email,
  minLength,
  maxLength,
  numeric,
  integer,
  decimal,
  between,
  alpha,
  alphaNum,
  url,
  ipAddress,
  sameAs,
  minValue,
  maxValue } from '@vuelidate/validators'
import {
  emailValidator,
  integerValidator,
  nameValidator,
  numericValidator,
  regexValidator,
  urlValidator,
} from '@/utils/validators'

const wrapValidator = (fn: (value: any) => boolean | string, fallbackMessage: string) =>
  helpers.withMessage(
    fallbackMessage,
    (value: any) => fn(value) === true,
  )

export const rules = {
  // Built-in
  required: helpers.withMessage('This field is required.', required),
  requiredIf: (cond: boolean | (() => boolean)) =>
    helpers.withMessage('This field is required.', requiredIf(cond)),
  requiredUnless: (cond: boolean | (() => boolean)) =>
    helpers.withMessage('This field is required.', requiredUnless(cond)),

  email: helpers.withMessage('Please enter a valid email', email),
  emailFormat: wrapValidator(emailValidator, 'Invalid email format'),
  phoneFormat: wrapValidator(
    (value: any) => regexValidator(value, /^[0-9\s()+-]+$/),
    'Only numbers and phone characters are allowed',
  ),
  integerFormat: wrapValidator(integerValidator, 'This field must be an integer'),
  nameFormat: wrapValidator(nameValidator, 'Only letters and spaces are allowed'),
  numericFormat: wrapValidator(numericValidator, 'Only numbers are allowed'),
  urlFormat: wrapValidator(urlValidator, 'URL is invalid'),
  numeric: helpers.withMessage('Must be a number', numeric),
  integer: helpers.withMessage('Must be an integer', integer),
  decimal: helpers.withMessage('Must be a decimal', decimal),
  alpha: helpers.withMessage('Only letters allowed', alpha),
  alphaNum: helpers.withMessage('Only letters and numbers allowed', alphaNum),
  url: helpers.withMessage('Must be a valid URL', url),
  ipAddress: helpers.withMessage('Must be a valid IP address', ipAddress),
  sameAs: (field: any, message = 'Values must match') =>
    helpers.withMessage(message, sameAs(field)),

  minLength: (len: number) =>
    helpers.withMessage(`Must be at least ${len} characters`, minLength(len)),
  maxLength: (len: number) =>
    helpers.withMessage(`Must not exceed ${len} characters`, maxLength(len)),
  minValue: (min: number) =>
    helpers.withMessage(`Must be at least ${min}`, minValue(min)),
  maxValue: (max: number) =>
    helpers.withMessage(`Must be at most ${max}`, maxValue(max)),
  between: (min: number, max: number) =>
    helpers.withMessage(`Value must be between ${min} and ${max}`, between(min, max)),

  passwordRequiredIf: (cond: boolean | (() => boolean)) =>
    helpers.withMessage('Password is required', requiredIf(cond)),

  custom: (fn: (value: any) => boolean, message: string) =>
    helpers.withMessage(message, fn),
}
