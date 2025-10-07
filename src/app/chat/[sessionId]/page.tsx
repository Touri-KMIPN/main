"use client"
import React, { use } from 'react'

export default function Page({params}: {params: Promise<{sessionId: string}>}) {
  const { sessionId } = use(params)
    return (
    <div>{sessionId}</div>
  )
}
