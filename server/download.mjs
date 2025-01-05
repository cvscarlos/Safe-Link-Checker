import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'tldts';

async function downloadDomainsRDAP() {
	const response = await fetch('https://data.iana.org/rdap/dns.json');
	const data = await response.json();
	const filePath = path.resolve(process.cwd(), 'data/tld-rdap.json');
	fs.writeFileSync(filePath, JSON.stringify(data));
	console.info('Domains saved to:', filePath);
}

function parseListAdblockStyle(line) {
	if (!line.startsWith('||')) return;
	return line.split('||')[1].split('^')[0];
}

function parseListIpsStyle(line) {
	if (!line.startsWith('0.0.0.0')) return;
	return line.split(' ')[1];
}

async function downloadLists(fileUrl) {
	try {
		const { data } = await axios.get(fileUrl);
		data.split('\n').forEach((line) => {
			try {
				const lineDomain = listAdblockStyleValues.includes(fileUrl)
					? parseListAdblockStyle(line)
					: parseListIpsStyle(line);
				if (!lineDomain) return;

				const parsedDomain = parse(lineDomain);
				const onlyDomain = parsedDomain.domain;

				domains[onlyDomain] ||= new Set();
				domains[onlyDomain].add(listIndexes.get(fileUrl));
			} catch (error) {
				console.error('Failed to parse domain:', line);
				throw error;
			}
		});
	} catch (error) {
		console.error('Failed to parse list:', fileUrl);
		throw error;
	}
}

const listsIpStyle = {
	'blp/Abuse': 'https://blocklistproject.github.io/Lists/abuse.txt',
	'blp/Drugs': 'https://blocklistproject.github.io/Lists/drugs.txt',
	'blp/Malware': 'https://blocklistproject.github.io/Lists/malware.txt',
	'blp/Piracy': 'https://blocklistproject.github.io/Lists/piracy.txt',
	'blp/Scam': 'https://blocklistproject.github.io/Lists/scam.txt',
	'blp/Ransomware': 'https://blocklistproject.github.io/Lists/ransomware.txt',
	'blp/Phishing': 'https://blocklistproject.github.io/Lists/phishing.txt',
	'blp/Fraud': 'https://blocklistproject.github.io/Lists/fraud.txt',
};
const listAdblockStyle = {
	'hagezi/Piracy': 'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/adblock/anti.piracy.txt',
	'hagezi/Fake': 'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/adblock/fake.txt',
};
const listAdblockStyleValues = Object.values(listAdblockStyle);
const lists = { ...listsIpStyle, ...listAdblockStyle };
const listIndexes = new Map(Object.entries(lists).map(([, url], index) => [url, index]));
const domains = {};

async function storeDomainLists() {
	const jsonDomains = Object.fromEntries(
		Object.entries(domains).map(([domain, listIds]) => [domain, Array.from(listIds)]),
	);
	const filePath = path.resolve(process.cwd(), 'data/domains.json');
	fs.writeFileSync(filePath, JSON.stringify(jsonDomains));
	console.info('Domains saved to:', filePath);

	const listIndexfilePath = path.resolve(process.cwd(), 'data/list-index.json');
	const listIndexesInverted = Object.fromEntries(Array.from(listIndexes).map(([key, value]) => [value, key]));
	fs.writeFileSync(listIndexfilePath, JSON.stringify(listIndexesInverted));
	console.info('List indexes saved to:', listIndexfilePath);
}

async function main() {
	try {
		await downloadDomainsRDAP();

		await Promise.all(Object.values(lists).map((url) => downloadLists(url)));
		await storeDomainLists();
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

await main();
