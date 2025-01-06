import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '../styles/globals.css';

export const metadata: Metadata = {
	title: 'Verifique se um Site é Seguro Agora',
	description:
		'Ferramenta online gratuita para verificar se sites são seguros ou maliciosos. Proteja-se contra phishing e links inseguros.',
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
