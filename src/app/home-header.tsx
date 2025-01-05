

export default function HomeHeader({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 bg-gray-100">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Verificador de Segurança de URL</h1>
        <p className="text-sm text-center text-gray-600">
          Cole uma URL abaixo para verificar se é potencialmente maliciosa ou recentemente registrada.
        </p>
        {children}
      </div>
    </main>
  )
}

