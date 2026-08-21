import { useState } from 'react';
import { z } from 'zod';

export const useValidation = (schema) => {
	const [errors, setErrors] = useState({});
	const [isValid, setIsValid] = useState(false);

	const validate = (data) => {
		try {
			schema.parse(data);
			setErrors({});
			setIsValid(true);
			return true;
		} catch (error) {
			const formattedErrors = {};
			error.errors.forEach((err) => {
				const path = err.path.join('.');
				formattedErrors[path] = err.message;
			});
			setErrors(formattedErrors);
			setIsValid(false);
			return false;
		}
	};

	return { errors, isValid, validate };
};