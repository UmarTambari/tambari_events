"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, CheckCircle } from 'lucide-react'

interface VerifyPaymentButtonProps {
  reference: string
}

export function VerifyPaymentButton({ reference }: VerifyPaymentButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()

 const handleVerify = async () => {
  setIsVerifying(true)

try {
    const fetchPromise = fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })

    await toast.promise(fetchPromise, {
      loading: 'Verifying payment...',
      success: 'Payment verified successfully!',
      error: 'Failed to verify payment',
    })

    const response = await fetchPromise
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Verification failed')
    }

    router.refresh()
  } catch (error) {
    console.error('Verification error:', error)
  } finally {
    setIsVerifying(false)
  }
}

  return (
    <button
      onClick={handleVerify}
      disabled={isVerifying}
      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
    >
      {isVerifying ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying...</span>
        </>
      ) : (
        <>
          <CheckCircle className="h-5 w-5" />
          <span>Verify Payment Now</span>
        </>
      )}
    </button>
  )
}