'use client'

import { useState, useMemo } from 'react'
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Shield, ShieldAlert, ShieldOff, Calendar, Globe } from 'lucide-react'

// Mock function to check if a domain is malicious
const isMaliciousDomain = (domain: string) => {
  const maliciousDomains = {
    'evil.com': 'Lista de Distribuição de Malware',
    'malware.com': 'Lista de Sites de Phishing',
    'phishing.com': 'Lista de Domínios de Spam'
  }
  return maliciousDomains[domain as keyof typeof maliciousDomains] || null
}

// Mock function to get domain registration date
const getDomainRegistrationDate = (domain: string) => {
  // In a real app, this would make an API call to a WHOIS service
  return new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<{
    domain: string;
    maliciousListName: string | null;
    registrationDate: Date;
    isNewDomain: boolean;
  } | null>(null)

  const domain = useMemo(() => {
    try {
      return new URL(url).hostname
    } catch {
      return null
    }
  }, [url])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain) {
      setResult(null)
      return
    }

    const maliciousListName = isMaliciousDomain(domain)
    const registrationDate = getDomainRegistrationDate(domain)
    const isNewDomain = (Date.now() - registrationDate.getTime()) < 180 * 24 * 60 * 60 * 1000 // 180 days

    setResult({
      domain,
      maliciousListName,
      registrationDate,
      isNewDomain
    })
  }

  const getSecurityStatus = () => {
    if (!result) return null
    if (result.maliciousListName) return 'danger'
    if (result.isNewDomain) return 'warning'
    return 'secure'
  }

  const securityStatus = getSecurityStatus()

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 bg-gray-100">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Verificador de Segurança de URL</h1>
        <p className="text-sm text-center text-gray-600">
          Cole uma URL abaixo para verificar se é potencialmente maliciosa ou recentemente registrada.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="url"
            placeholder="https://exemplo.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full text-lg py-6 px-4"
          />
          <Button type="submit" className="w-full">
            Verificar URL
          </Button>
        </form>
        {result && (
          <div className="mt-4 space-y-4">
            <div className={`p-4 rounded-lg shadow ${
              securityStatus === 'danger' ? 'bg-red-100' :
              securityStatus === 'warning' ? 'bg-yellow-100' :
              'bg-green-100'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Status de Segurança</h2>
                {securityStatus === 'danger' && <ShieldOff className="text-red-600" size={24} />}
                {securityStatus === 'warning' && <ShieldAlert className="text-yellow-600" size={24} />}
                {securityStatus === 'secure' && <Shield className="text-green-600" size={24} />}
              </div>
              <p className={`font-medium ${
                securityStatus === 'danger' ? 'text-red-600' :
                securityStatus === 'warning' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {result.maliciousListName ? "Potencialmente Malicioso" : 
                 result.isNewDomain ? "Domínio Recentemente Registrado" : 
                 "Seguro"}
              </p>
              {result.maliciousListName && (
                <p className="mt-2 text-sm">
                  Encontrado em: <span className="font-medium">{result.maliciousListName}</span>
                </p>
              )}
              {result.isNewDomain && !result.maliciousListName && (
                <p className="mt-2 text-sm">
                  Este domínio foi registrado recentemente. Tenha cuidado.
                </p>
              )}
            </div>
            <div className={`p-4 rounded-lg shadow ${
              result.isNewDomain ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Idade do Domínio</h3>
                <Calendar size={20} className={result.isNewDomain ? 'text-yellow-600' : 'text-green-600'} />
              </div>
              <p className={`font-medium ${
                result.isNewDomain ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {result.isNewDomain 
                  ? "Menos de 6 meses" 
                  : "Mais de 6 meses"}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Detalhes do Domínio</h3>
                <Globe size={20} />
              </div>
              <p><span className="font-medium">Domínio:</span> {result.domain}</p>
              <p><span className="font-medium">Data de Registro:</span> {result.registrationDate.toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

