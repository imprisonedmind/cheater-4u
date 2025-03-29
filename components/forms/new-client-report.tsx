"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export default function ReportFormClient() {
  const [activeTab, setActiveTab] = useState<
    "video" | "screenshot" | "description"
  >("video");
  const [game, setGame] = useState<"CS2" | "VALORANT">("CS2");

  return (
    <div className="space-y-6">
      {/* STEAM URL */}
      <div className="space-y-2">
        <Label htmlFor="steam_url">Steam Profile URL</Label>
        <Input
          id="steam_url"
          name="steam_url"
          placeholder="https://steamcommunity.com/id/username"
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter the full URL to the player's Steam profile
        </p>
      </div>

      {/* EVIDENCE TYPE TABS */}
      <div>
        <Label>Evidence Type</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Select the type of evidence you&#39;re providing
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (
            val === "video" ||
            val === "screenshot" ||
            val === "description"
          ) {
            setActiveTab(val);
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              name="video_url"
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground">
              Link to YouTube, Twitch clip, or other video hosting
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="video_description">Video Description</Label>
            <Textarea
              id="video_description"
              name="video_description"
              rows={3}
              placeholder="Describe what happens in the video and at what timestamp the suspicious behavior occurs"
            />
          </div>
        </TabsContent>

        <TabsContent value="screenshot" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="screenshot_url">Screenshot URL</Label>
            <Input
              id="screenshot_url"
              name="screenshot_url"
              placeholder="https://imgur.com/..."
            />
            <p className="text-xs text-muted-foreground">
              Link to Imgur or other image hosting site
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="screenshot_description">
              Screenshot Description
            </Label>
            <Textarea
              id="screenshot_description"
              name="screenshot_description"
              rows={3}
              placeholder="Describe what the screenshot shows and why it&#39;s suspicious"
            />
          </div>
        </TabsContent>

        <TabsContent value="description" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="detailed_description">Detailed Description</Label>
            <Textarea
              id="detailed_description"
              name="detailed_description"
              rows={6}
              placeholder="Provide a detailed description of the suspicious behavior you observed"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* GAME SELECT */}
      <div className="space-y-2">
        <Label>Game</Label>
        <Tabs
          value={game}
          onValueChange={(val) => setGame(val as "CS2" | "VALORANT")}
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="CS2">CS2</TabsTrigger>
            <TabsTrigger value="VALORANT">VALORANT</TabsTrigger>
          </TabsList>
        </Tabs>
        <input type="hidden" name="game" value={game} />
      </div>

      {/* INFO BOX */}
      <div className="rounded-md bg-secondary/50 p-4 text-sm flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Important</p>
          <p className="text-muted-foreground mt-1">
            Only submit reports for players you genuinely suspect of cheating.
            False reports harm the community and dilute the effectiveness of the
            system.
          </p>
        </div>
      </div>
    </div>
  );
}
