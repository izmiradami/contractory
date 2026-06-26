'use client'

import { useState, useEffect, useRef } from 'react'
import { analyzeArcCompatibility }      from '@/packages/blockchain/providers/arc'
import type { CompatibilityIssue }      from '@/packages/blockchain/core/interface'

interface CompatibilityResult {
  issues:  CompatibilityIssue[]
  score:   number   // 0-100
  passed:  boolean
  loading: boolean
}

function computeScore(issues: CompatibilityIssue[]): number {
  let penalty = 0
  for (const issue of issues) {
    if (issue.severity === 'error')   penalty += 20
    if (issue.severity === 'warning') penalty += 8
    if (issue.severity === 'info')    penalty += 2
  }
  return Math.max(0, 100 - penalty)
}

export function useCompatibilityAnalyzer(source: string, debounceMs = 600) {
  const [result, setResult] = useState<CompatibilityResult>({
    issues:  [],
    score:   100,
    passed:  true,
    loading: false,
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!source.trim()) {
      setResult({ issues: [], score: 100, passed: true, loading: false })
      return
    }

    setResult((prev) => ({ ...prev, loading: true }))

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const issues = analyzeArcCompatibility(source)
      const score  = computeScore(issues)
      setResult({ issues, score, passed: score >= 80, loading: false })
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [source, debounceMs])

  return result
}
