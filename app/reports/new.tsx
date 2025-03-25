import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"

export default function NewReportPage() {
  return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Submit a Report</h1>
          <p className="text-muted-foreground">Report a suspected cheater with evidence to help keep games fair</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>Provide information about the suspected cheater</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="steam_url">Steam Profile URL</Label>
                  <Input id="steam_url" placeholder="https://steamcommunity.com/id/username" required />
                  <p className="text-xs text-muted-foreground">Enter the full URL to the player's Steam profile</p>
                </div>

                <Tabs defaultValue="video">
                  <div className="mb-4">
                    <Label>Evidence Type</Label>
                    <p className="text-xs text-muted-foreground mb-2">Select the type of evidence you're providing</p>
                  </div>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                  </TabsList>
                  <TabsContent value="video" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="video_url">Video URL</Label>
                      <Input id="video_url" placeholder="https://youtube.com/watch?v=..." />
                      <p className="text-xs text-muted-foreground">
                        Link to YouTube, Twitch clip, or other video hosting site
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="video_description">Video Description</Label>
                      <Textarea
                          id="video_description"
                          placeholder="Describe what happens in the video and at what timestamp the suspicious behavior occurs"
                          rows={3}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="screenshot" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="screenshot_url">Screenshot URL</Label>
                      <Input id="screenshot_url" placeholder="https://imgur.com/..." />
                      <p className="text-xs text-muted-foreground">Link to Imgur or other image hosting site</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="screenshot_description">Screenshot Description</Label>
                      <Textarea
                          id="screenshot_description"
                          placeholder="Describe what the screenshot shows and why it's suspicious"
                          rows={3}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="description" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="detailed_description">Detailed Description</Label>
                      <Textarea
                          id="detailed_description"
                          placeholder="Provide a detailed description of the suspicious behavior you observed"
                          rows={6}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="game">Game</Label>
                  <Input id="game" placeholder="CS2, Valorant, etc." />
                </div>

                <div className="rounded-md bg-secondary/50 p-4 text-sm flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Important</p>
                    <p className="text-muted-foreground mt-1">
                      Only submit reports for players you genuinely suspect of cheating. False reports harm the community
                      and dilute the effectiveness of the system.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Submit Report</Button>
          </CardFooter>
        </Card>
      </div>
  )
}

  