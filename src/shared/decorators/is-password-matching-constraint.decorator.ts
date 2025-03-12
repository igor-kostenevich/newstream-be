import { NewPasswordInput } from "@/src/modules/auth/password-recovery/inputs/new-password.input"
import { ValidationArguments, ValidatorConstraint, type ValidatorConstraintInterface } from "class-validator"

@ValidatorConstraint({ name: 'isPasswordMatching', async: false })
export class IsPasswordMatchingConstraint implements ValidatorConstraintInterface {
  public validate(passwordRepeat: string, args: ValidationArguments) {
    const object = args.object as NewPasswordInput

    return passwordRepeat === object.password
  }

  public defaultMessage(validationArguments?: ValidationArguments) {
    return 'Passwords do not match'
  }
}