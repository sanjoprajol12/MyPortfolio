export type ValidationErrors = Record<string, string[]>

const errors = ref<ValidationErrors | []>({})

export const useErrors = () => {
  const showValidationError = (newErrors: ValidationErrors) => {
    errors.value = newErrors

    setTimeout(() => {
      errors.value = []
    }, 5000)
  }

  return {
    errors: readonly(errors),
    showValidationError,
  }
}

export const isActiveStatus = (stat: boolean | number) => {
  if (!stat)
    return 'error'

  return 'success'
}
