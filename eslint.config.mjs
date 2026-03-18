import nextConfig from 'eslint-config-next';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const config = [
	...nextConfig,
	prettierRecommended,
	{
		ignores: ['.next/', 'out/', 'node_modules/'],
	},
];

export default config;
