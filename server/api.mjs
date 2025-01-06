import express from 'express';
import { parse } from 'tldts';
import axios from 'axios';
import fs from 'node:fs';
import cors from 'cors';

const tldRdap = JSON.parse(fs.readFileSync('./data/tld-rdap.json', 'utf-8'));
const domainLists = JSON.parse(fs.readFileSync('./data/domains.json', 'utf-8'));
const listNames = JSON.parse(fs.readFileSync('./data/list-index.json', 'utf-8'));

const app = express();
const port = process.env.PORT || 3300;

const corsMiddleware = cors({
	origin: ['http://localhost:3000', 'http://example.com'],
});

app.get('/', (req, res) => {
	res.send(['Hello World!']);
});

app.post('/query', corsMiddleware, async (req, res) => {
	const link = String(req.query.domain || '').trim();
	if (!link) throw new Error('DOMAIN_IS_REQUIRED');

	const parsedDomain = parse(link);
	const domain = parsedDomain.domain;

	const registrationDate = await getDomainRegistrationDate(domain);
	const lists = await includedOnLists(domain);

	res.send({ domain, registrationDate, lists });
});

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});

async function includedOnLists(domain) {
	const lists = domainLists[domain];
	if (!lists) return [];

	return lists.map((listId) => listNames[listId]);
}

/**
 * @param {string} domain
 */
async function getDomainRegistrationDate(domain) {
	const tld = domain.split('.').slice(-1)[0];
	const rdapApi = tldRdap.services.find((s) => {
		return s[0].includes(tld);
	});

	if (!rdapApi) throw new Error('Infelizmente, este domínio não pode ser verificado');

	const { data: rdapApiData } = await axios(`${rdapApi[1]}domain/${domain}`);

	const registrationDateStr = rdapApiData.events.find((e) => e.eventAction === 'registration')?.eventDate;
	if (!registrationDateStr) throw new Error('Não foi possível obter a data de registro deste domínio');

	return new Date(registrationDateStr).toISOString().split('T')[0];
}
