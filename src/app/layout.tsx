import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '../styles/globals.css';

export const metadata: Metadata = {
	title: 'Verificador de Links: Este Link é Seguro?',
	description:
		'Verifique se o link é seguro com nossa ferramenta gratuita. Proteja-se contra phishing, malware e botnets antes de clicar.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
			</head>
			<body>{children}</body>
		</html>
	);
}
