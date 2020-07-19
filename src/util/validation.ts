namespace App {
    //validate

    export interface Validatable {
        value: string | number,
        required?: boolean,
        minLength?: number,
        maxLength?: number,
        max?: number,
        min?: number
    }

    export const validate = (ele: Validatable): boolean => {
        let isValid = true;

        if (ele.required) {
            isValid = isValid && ele.value.toString().trim().length !== 0
        }

        if (ele.minLength != null && typeof ele.value === 'string') {
            isValid = isValid && ele.value.trim().length > ele.minLength
        }

        if (ele.maxLength != null && typeof ele.value === 'string') {
            isValid = isValid && ele.value.trim().length < ele.maxLength
        }

        if (ele.min != null && typeof ele.value === 'number') {
            isValid = isValid && ele.value > ele.min
        }

        if (ele.max != null && typeof ele.value === 'number') {
            isValid = isValid && ele.value < ele.max
        }


        return isValid;
    }
}