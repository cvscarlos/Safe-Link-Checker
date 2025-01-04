'use client'

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, ShieldAlert, ShieldOff, Calendar } from 'lucide-react'

// Mock function to check if a domain is malicious
const isMaliciousDomain = (domain: string) => {
  const maliciousDomains = {
    'evil.com': 'Malware Distribution List',
    'malware.com': 'Phishing Sites List',
    'phishing.com': 'Spam Domains List'
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
        <h1 className="text-2xl font-bold text-center">URL Security Checker</h1>
        <p className="text-sm text-center text-gray-600">
          Paste a URL below to check if it's potentially malicious or newly registered.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full text-lg py-6 px-4"
          />
          <Button type="submit" className="w-full">
            Check URL
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
                <h2 className="text-lg font-semibold">Security Status</h2>
                {securityStatus === 'danger' && <ShieldOff className="text-red-600" size={24} />}
                {securityStatus === 'warning' && <ShieldAlert className="text-yellow-600" size={24} />}
                {securityStatus === 'secure' && <Shield className="text-green-600" size={24} />}
              </div>
              <p className={`font-medium ${
                securityStatus === 'danger' ? 'text-red-600' :
                securityStatus === 'warning' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {result.maliciousListName ? "Potentially Malicious" : 
                 result.isNewDomain ? "Recently Registered Domain" : 
                 "Secure"}
              </p>
              {result.maliciousListName && (
                <p className="mt-2 text-sm">
                  Found in: <span className="font-medium">{result.maliciousListName}</span>
                </p>
              )}
              {result.isNewDomain && !result.maliciousListName && (
                <p className="mt-2 text-sm">
                  This domain was registered recently. Exercise caution.
                </p>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Domain Details</h3>
                <Calendar size={20} />
              </div>
              <p><span className="font-medium">Domain:</span> {result.domain}</p>
              <p><span className="font-medium">Registration Date:</span> {result.registrationDate.toDateString()}</p>
            </div>
            <div className={`p-4 rounded-lg shadow ${
              result.isNewDomain ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Domain Age</h3>
                <Calendar size={20} className={result.isNewDomain ? 'text-yellow-600' : 'text-green-600'} />
              </div>
              <p className={`font-medium ${
                result.isNewDomain ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {result.isNewDomain 
                  ? "Less than 6 months old" 
                  : "More than 6 months old"}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

