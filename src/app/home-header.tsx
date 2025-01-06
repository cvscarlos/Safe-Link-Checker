import type { ReactNode } from 'react';

export default function HomeHeader({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<main className="flex min-h-screen flex-col items-center justify-start p-4 bg-gray-100">
			<div className="w-full max-w-screen-md space-y-4">
				<h1 className="text-2xl font-bold text-center">Verificador de Links</h1>
				<p className="text-sm text-center text-gray-600 mb-2">
					Antes de clicar em um link, use nossa ferramenta para garantir que ele é seguro. <br />A verificação
					detecta ameaças como phishing, malware e botnets, protegendo você contra links perigosos e
					garantindo uma navegação mais segura.
				</p>
				{children}
			</div>
		</main>
	);
}
