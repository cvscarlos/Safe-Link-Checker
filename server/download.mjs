import fetch from 'node-fetch';
import fs from 'node:fs';
import path from 'node:path';

async function downloadDomainsRDAP() {
	const response = await fetch('https://data.iana.org/rdap/dns.json');
	const data = await response.json();
	const filePath = path.resolve(process.cwd(), 'data/tld-rdap.json');
	fs.writeFileSync(filePath, JSON.stringify(data));
	console.info('Domains saved to:', filePath);
}

async function main() {
	try {
		await downloadDomainsRDAP();
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

await main();
