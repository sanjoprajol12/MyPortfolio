import { useVuelidate } from '@vuelidate/core'

export function useFormValidation<T extends Record<string, any>>(
  rules: any,
  form: T,
) {
  const v$ = useVuelidate(rules, form)

  const hasError = computed(() => v$.value.$error)
  const isValid = computed(() => !v$.value.$invalid)

  const touch = () => v$.value.$touch()
  const resetValidation = () => v$.value.$reset()

  const touchField = (field: keyof T) => {
    v$.value[field]?.$touch()
  }

  const validationErrors = (field: keyof T) =>
    v$.value[field]?.$dirty
      ? v$.value[field]?.$errors.map((e: { $message: string }) => e.$message) ?? []
      : []

  return {
    v$,
    hasError,
    isValid,
    touch,
    resetValidation,
    touchField,
    validationErrors,
  }
}