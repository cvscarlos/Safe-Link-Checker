'use client';

import { FormEvent, useState } from 'react';
import { Shield, ShieldAlert, ShieldOff, Calendar, Globe } from 'lucide-react';
import axiosRetry from 'axios-retry';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/spinner';
import * as tldRdap from '../../data/tld-rdap.json';

axiosRetry(axios, { retries: 3 });

type RdapApiResult = {
	events: { eventAction: string; eventDate: string }[];
};

async function isMaliciousDomain(domain: string) {
	const maliciousDomains = {
		'evil.com': 'Lista de Distribuição de Malware',
		'malware.com': 'Lista de Sites de Phishing',
		'phishing.com': 'Lista de Domínios de Spam',
	};
	return maliciousDomains[domain as keyof typeof maliciousDomains] || null;
}

async function getDomainRegistrationDate(domain: string) {
	const tld = domain.split('.').slice(-1)[0];
	const rdapApi = tldRdap.services.find((s) => {
		return s[0].includes(tld);
	});

	if (!rdapApi) throw new Error('Infelizmente, este domínio não pode ser verificado');

	const corsProxy = 'https://api.allorigins.win/raw?url=';
	const rdapApiUrl = encodeURIComponent(rdapApi[1] + 'domain/' + domain);
	const { data: rdapApiData } = await axios<RdapApiResult>(corsProxy + rdapApiUrl);

	const registrationDateStr = rdapApiData.events.find((e: any) => e.eventAction === 'registration')?.eventDate;
	if (!registrationDateStr) throw new Error('Não foi possível obter a data de registro deste domínio');

	return new Date(registrationDateStr);
}

const domainRegex = /\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.[a-z]{2,}(\.[a-z]{2,})?\b/i;

export default function HomeForm() {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<{
		domain: string;
		maliciousListName: string | null;
		registrationDate: Date;
		domainMonths: number;
		isNewDomain: boolean;
	} | null>(null);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setResult(null);
		setIsLoading(true);

		const urlInput = ((e.target as HTMLFormElement).elements.namedItem('domain') as HTMLInputElement).value;
		const domain = urlInput.match(domainRegex)?.[0];

		if (!domain) {
			setError('Por favor, insira um link válida (ex: https://example.com)');
			setIsLoading(false);
			return;
		}

		try {
			const [maliciousListName, registrationDate] = await Promise.all([
				isMaliciousDomain(domain),
				getDomainRegistrationDate(domain),
			]);

			const domainMonths = Math.floor((Date.now() - registrationDate.getTime()) / (30 * 24 * 60 * 60 * 1000)); // not precise, I know

			console.log({ domainMonths });

			setResult({
				domain,
				maliciousListName,
				registrationDate,
				domainMonths,
				isNewDomain: domainMonths < 12,
			});
		} catch (err) {
			setError('Ocorreu um erro ao verificar o domínio. Por favor, tente novamente.');
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusClass = () => {
		if (!result) return null;
		if (result.maliciousListName) return 'red';
		if (result.domainMonths < 6) return 'red';
		if (result.isNewDomain) return 'yellow';
		return 'green';
	};

	const getAgeClass = () => {
		if (!result) return '---';
		if (result.domainMonths >= 12) return 'green';
		if (result.domainMonths >= 6) return 'yellow';
		return 'red';
	};

	return (
		<div>
			{isLoading && <Spinner />}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Input
						type="text"
						name="domain"
						placeholder="exemplo.com.br"
						required
						onChange={() => {
							setError(null);
						}}
						className={`w-full text-lg py-6 px-4 ${error ? 'border-red-500' : ''}`}
					/>
					{error && <p className="mt-2 text-sm text-red-600">{error}</p>}
				</div>
				<Button type="submit" className="w-full">
					Verificar Link
				</Button>
			</form>

			{result && (
				<div className="mt-4 space-y-4">
					<div
						className={`p-4 rounded-lg shadow ${
							getStatusClass() === 'red'
								? 'bg-red-100'
								: getStatusClass() === 'yellow'
									? 'bg-yellow-100'
									: 'bg-green-100'
						}`}
					>
						<div className="flex items-center justify-between mb-2">
							<h2 className="text-lg font-semibold">Status de Segurança</h2>
							{getStatusClass() === 'red' && <ShieldOff className="text-red-600" size={24} />}
							{getStatusClass() === 'yellow' && <ShieldAlert className="text-yellow-600" size={24} />}
							{getStatusClass() === 'green' && <Shield className="text-green-600" size={24} />}
						</div>
						<p className={`font-medium bg-${getStatusClass()}-100`}>
							{result.maliciousListName
								? 'Potencialmente Malicioso'
								: result.isNewDomain
									? 'Domínio Recentemente Registrado'
									: 'Seguro'}
						</p>
						{result.maliciousListName && (
							<p className="mt-2 text-sm">
								Encontrado em: <span className="font-medium">{result.maliciousListName}</span>
							</p>
						)}
						{result.isNewDomain && !result.maliciousListName && (
							<p className="mt-2 text-sm">Este domínio foi registrado recentemente. Tenha cuidado.</p>
						)}
					</div>

					<div className={`p-4 rounded-lg shadow bg-${getAgeClass()}-100`}>
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-semibold">Idade do Domínio</h3>
							<Calendar size={20} className={`text-${getAgeClass()}-600`} />
						</div>
						<p className={`font-medium text-${getAgeClass()}-600`}>
							{result.domainMonths >= 12
								? 'Mais de 1 ano'
								: result.domainMonths >= 6
									? 'Mais de 6 meses'
									: 'Menos de 6 meses'}
						</p>
					</div>

					<div className="bg-white p-4 rounded-lg shadow">
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-semibold">Detalhes do Domínio</h3>
							<Globe size={20} />
						</div>
						<p>
							<span className="font-medium">Domínio:</span> {result.domain}
						</p>
						<p>
							<span className="font-medium">Data de Registro:</span>{' '}
							{result.registrationDate.toLocaleDateString('pt-BR')}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
