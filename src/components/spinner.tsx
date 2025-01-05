import { Loader2 } from 'lucide-react';

export function Spinner() {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
				<Loader2 className="h-6 w-6 animate-spin text-blue-500" />
				<p className="text-gray-700 font-medium">Verificando...</p>
			</div>
		</div>
	);
}
