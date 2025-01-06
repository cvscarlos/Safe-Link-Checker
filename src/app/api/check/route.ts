/* eslint-env node */

import { parse } from 'tldts';
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
const tldRdap = JSON.parse(fs.readFileSync(`${dataDir}/tld-rdap.json`, 'utf-8'));
const domainLists = JSON.parse(fs.readFileSync(`${dataDir}/domains.json`, 'utf-8'));
const listNames = JSON.parse(fs.readFileSync(`${dataDir}/list-index.json`, 'utf-8'));

// Vercel dynamic export
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
	try {
		const url = new URL(req.url);
		const link = (url.searchParams.get('domain') || '').trim();
		if (!link) throw new Error('DOMAIN_IS_REQUIRED');

		const parsedDomain = parse(link);
		const domain = parsedDomain.domain;
		if (!domain) throw new Error('INVALID_DOMAIN');

		const registrationDate = await getDomainRegistrationDate(domain);
		const lists = await includedOnLists(domain);

		return new Response(JSON.stringify({ domain, registrationDate, lists }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

async function includedOnLists(domain: string): Promise<string[]> {
	const lists = domainLists[domain];
	if (!lists) return [];

	return lists.map((listId: number) => listNames[listId]);
}

async function getDomainRegistrationDate(domain: string): Promise<string> {
	const tld = domain.split('.').slice(-1)[0];
	const rdapApi = tldRdap.services.find((s: any[]) => s[0].includes(tld));

	if (!rdapApi) throw new Error('This domain cannot be verified');

	const { data: rdapApiData } = await axios.get(`${rdapApi[1]}domain/${domain}`);

	const registrationDateStr = rdapApiData.events.find(
		(e: { eventAction: string }) => e.eventAction === 'registration',
	)?.eventDate;

	if (!registrationDateStr) {
		throw new Error('Unable to fetch the registration date for this domain');
	}

	return new Date(registrationDateStr).toISOString().split('T')[0];
}
