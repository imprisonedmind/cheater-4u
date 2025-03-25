"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export function RelatedProfilesCard() {
  return (
      <Card>
        <CardHeader>
          <CardTitle>Related Profiles</CardTitle>
          <CardDescription>Players frequently seen with this account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No related profiles found yet.</p>
        </CardContent>
      </Card>
  )
}
