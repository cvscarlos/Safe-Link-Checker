import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'tldts';

const listsIpStyle = {
	Abuse: 'https://blocklistproject.github.io/Lists/abuse.txt',
	Drogas: 'https://blocklistproject.github.io/Lists/drugs.txt',
	Malware: 'https://blocklistproject.github.io/Lists/malware.txt',
	Pirataria: 'https://blocklistproject.github.io/Lists/piracy.txt',
	Scam: 'https://blocklistproject.github.io/Lists/scam.txt',
	Ransomware: 'https://blocklistproject.github.io/Lists/ransomware.txt',
	Phishing: 'https://blocklistproject.github.io/Lists/phishing.txt',
	Fraude: 'https://blocklistproject.github.io/Lists/fraud.txt',
};
const listAdblockStyle = {
	Pirataria: 'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/adblock/anti.piracy.txt',
	Fraude: 'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/adblock/fake.txt',
};
const listAdblockStyleValues = Object.values(listAdblockStyle);
const lists = { ...listsIpStyle, ...listAdblockStyle };
const listEntries = Object.entries(lists);
const listIndexesByUrl = new Map(listEntries.map(([, url], index) => [url, index]));
const listIndexesByName = new Map(listEntries.map(([name], index) => [index, name]));
const domains = {};

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
				domains[onlyDomain].add(listIndexesByUrl.get(fileUrl));
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

async function storeDomainLists() {
	const jsonDomains = Object.fromEntries(
		Object.entries(domains).map(([domain, listIds]) => [domain, Array.from(listIds)]),
	);
	const filePath = path.resolve(process.cwd(), 'data/domains.json');
	fs.writeFileSync(filePath, JSON.stringify(jsonDomains));
	console.info('Domains saved to:', filePath);

	const listIndexfilePath = path.resolve(process.cwd(), 'data/list-index.json');
	fs.writeFileSync(listIndexfilePath, JSON.stringify(Object.fromEntries(listIndexesByName)));
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
