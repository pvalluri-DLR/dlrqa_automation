export class BaseUtils {

    static getCurrentDateTime(): string {
		const now = new Date();
		const pad = (value: number): string => String(value).padStart(2, '0');

		return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
	}

	// Format: _MMddyyHHmm_<sa>_ (e.g. _1118262188_SA_ when sa = 'SA')
	static getFormattedDateStamp(sa: string): string {
		const now = new Date();
		const pad = (value: number): string => String(value).padStart(2, '0');
		const stamp = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getFullYear() % 100)}${pad(now.getHours())}${pad(now.getMinutes())}`;

		return `_${stamp}_${sa}_`;
	}
	
	// Removed instance method getCurrentDateTime since it's now static
	static getRandomString(length: number = 8): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

}
