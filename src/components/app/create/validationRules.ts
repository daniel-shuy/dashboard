import { PATTERNS } from '../../../config';

export class ValidationRules {

    appName = (value: string): { isValid: boolean, error: any[] } => {
        const lowercaseRegex = new RegExp('^[a-z0-9-. ][a-z0-9-. ]*[a-z0-9-. ]$')
        const startAndEndAlphanumericRegex = new RegExp(`^[a-zA-Z0-9 ].*[a-z0-9A-Z ]$`)
        const spacNotAllowedRegex = new RegExp('^[\s]$')
        let error = []
        if (value.length < 5) {
            error.push('Minimum 5 characters required')
        }

        if (!lowercaseRegex.test(value)) {
            error.push('Use only lowercase alphanumeric characters "-" or "."')
        }

        if (!startAndEndAlphanumericRegex.test(value)) {
            error.push('Start and end with an alphanumeric character only')
        }

        if (!spacNotAllowedRegex.test(value)) {
            error.push('Do not Allowed space')
        }

        if (!value) {
            error.push('This is a required field')
        }

        if (value.length > 30) {
            error.push('Must not exceed 30 characters')
        }

        return {
            isValid: false, error: error
        }
        // let re = PATTERNS.APP_NAME;
        // let regExp = new RegExp(re);
        // let test = regExp.test(value);
        // if (value.length === 0) return { isValid: false, error: 'This is required field' };
        // if (value.length < 3) return { isValid: false, error: 'Atleast 3 characters required' };
        // if (value.length > 30) return { isValid: false, error: 'max 30 characters allowed' };
        // else if (!test) return { isValid: false, error: 'Min 3 characters; Start with lowercase; Use (a-z), (0-9), (-), (.)s; Do not use \'spaces\'' };
        // else return { isValid: true, error: '' };
    }

    team = (projectId: number): { isValid: boolean, error: any[] } => {
        let found = !!projectId;
        if (found) return { isValid: true, error: [] };
        else return { isValid: false, error: ['This is a required field'] };
    }

} 
