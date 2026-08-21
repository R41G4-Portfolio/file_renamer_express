import { UAParser } from 'ua-parser-js';

export const getDeviceFamily = (uaString) => {
	const parser = new UAParser(uaString);
	const { browser, os, device } = parser.getResult();

	// Normalizamos a una cadena estable: "OS-Browser-Type"
	// Ejemplo: "Windows-Chrome-desktop" o "iOS-Mobile Safari-mobile"
	const deviceType = device.type || 'desktop';
	
	return `${os.name}-${browser.name}-${deviceType}`;
};