'use client';

import { FormEvent, useState } from 'react';
import { Shield, ShieldAlert, ShieldOff, Calendar, Globe } from 'lucide-react';
import axiosRetry from 'axios-retry';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/spinner';

axiosRetry(axios, { retries: 3 });

const domainRegex = /\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z]{2,})+\b/i;

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
		const site = urlInput.match(domainRegex)?.[0] || '';

		if (!site) {
			setError('Por favor, insira um link válido (ex: https://example.com)');
			setIsLoading(false);
			return;
		}

		try {
			const { data } = await axios.post(`/api/check?domain=${site}`);
			const maliciousListName = data.lists.join(', ');
			const registrationDate = new Date(data.registrationDate);
			const domainMonths = Math.floor((Date.now() - registrationDate.getTime()) / (30 * 24 * 60 * 60 * 1000)); // not precise, I know

			setResult({
				domain: data.domain,
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

	const statusClass = (() => {
		if (!result) return null;
		if (result.maliciousListName) return 'red';
		if (result.domainMonths < 6) return 'red';
		if (result.isNewDomain) return 'yellow';
		return 'green';
	})();

	const ageClass = (() => {
		if (!result) return '---';
		if (result.domainMonths >= 12) return 'green';
		if (result.domainMonths >= 6) return 'yellow';
		return 'red';
	})();

	return (
		<div>
			{isLoading && <Spinner />}

			<form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
				<div>
					<label htmlFor="domain" className="block text-sm mb-1">
						Cole o link abaixo:
					</label>
					<Input
						type="text"
						name="domain"
						id="domain"
						placeholder="exemplo.com.br"
						required
						onChange={() => {
							setError(null);
						}}
						className={`w-full text-lg py-6 px-4 ${error && 'border-red-500'}`}
					/>
					{error && <p className="mt-2 text-sm text-red-600">{error}</p>}
				</div>
				<Button type="submit" className="w-full text-lg">
					Verificar Link
				</Button>
			</form>

			{result && (
				<div className="mt-4 space-y-4">
					<div
						className={`p-4 rounded-lg shadow ${statusClass === 'red' ? 'bg-red-100' : statusClass === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'}`}
					>
						<div className="flex items-center justify-between mb-2">
							<h2 className="text-lg font-semibold">Status de Segurança</h2>
							{statusClass === 'red' && <ShieldOff className="text-red-600" size={24} />}
							{statusClass === 'yellow' && <ShieldAlert className="text-yellow-600" size={24} />}
							{statusClass === 'green' && <Shield className="text-green-600" size={24} />}
						</div>
						<p
							className={`font-medium ${statusClass === 'red' ? 'text-red-900' : statusClass === 'yellow' ? 'text-yellow-900' : 'text-green-900'}`}
						>
							{result.maliciousListName
								? 'Este site pode ser perigoso'
								: result.isNewDomain
									? 'Domínio registrado recentemente'
									: `Este site parece seguro: ${result.domain}`}
						</p>
						{result.maliciousListName && (
							<p className="mt-2 text-sm">
								Encontrado nas listas de:{' '}
								<span className="font-medium">{result.maliciousListName}</span>
							</p>
						)}
						{result.isNewDomain && !result.maliciousListName && (
							<p className="mt-2 text-sm">Este domínio foi registrado recentemente. Tenha cuidado.</p>
						)}
					</div>

					<div
						className={`p-4 rounded-lg shadow ${ageClass === 'red' ? 'bg-red-100' : ageClass === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'}`}
					>
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-semibold">Idade do Domínio</h3>
							<Calendar
								size={20}
								className={
									ageClass === 'red'
										? 'text-red-600'
										: ageClass === 'yellow'
											? 'text-yellow-600'
											: 'text-green-600'
								}
							/>
						</div>
						<p
							className={`font-medium ${ageClass === 'red' ? 'text-red-900' : ageClass === 'yellow' ? 'text-yellow-900' : 'text-green-900'}`}
						>
							{result.domainMonths >= 12
								? 'Mais de 1 ano'
								: result.domainMonths >= 6
									? 'Entre 6 e 12 meses'
									: 'Menos de 6 meses'}
						</p>
						{result.isNewDomain && (
							<p className="mt-2 text-sm">
								Sites muito novos podem ser menos confiáveis, então tenha cuidado.
							</p>
						)}
						{!result.isNewDomain && (
							<p className="mt-2 text-sm">
								Sites mais antigos costumam ser mais confiáveis, mas isso não é uma regra.
							</p>
						)}
					</div>

					<div className="bg-white p-4 rounded-lg shadow">
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-semibold">Detalhes do Domínio</h3>
							<Globe size={20} />
						</div>
						<p>
							<span className="font-medium">Nome do site:</span> <strong>{result.domain}</strong>
						</p>
						<p>
							<span className="font-medium">Registrado em:</span>{' '}
							<strong>{result.registrationDate.toLocaleDateString('pt-BR')}</strong>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
