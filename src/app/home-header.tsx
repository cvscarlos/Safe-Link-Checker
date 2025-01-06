import type { ReactNode } from 'react';

export default function HomeHeader({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<main className="flex min-h-screen flex-col items-center justify-start p-4 bg-gray-100">
			<div className="w-full max-w-md space-y-4">
				<h1 className="text-2xl font-bold text-center">Verificador de Sites Seguros</h1>
				<p className="text-sm text-center text-gray-600">
					Cole o link abaixo para verificar se ele é confiável. A ferramenta identifica possíveis riscos, como
					sites falsos ou perigosos.
				</p>
				{children}
			</div>
		</main>
	);
}
