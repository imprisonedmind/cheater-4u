// EvidenceForm.tsx
import React, { useState } from "react";
import { X } from "lucide-react";

interface EvidenceFormProps {
  onSubmit: (url: string, description: string) => void;
  onCancel: () => void;
}

export const EvidenceForm = ({ onSubmit, onCancel }: EvidenceFormProps) => {
  const [newEvidenceUrl, setNewEvidenceUrl] = useState("");
  const [newEvidenceDescription, setNewEvidenceDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newEvidenceUrl.includes("youtube.com") &&
      !newEvidenceUrl.includes("youtu.be")
    ) {
      alert("Please enter a valid YouTube URL");
      return;
    }
    onSubmit(newEvidenceUrl, newEvidenceDescription);
    setNewEvidenceUrl("");
    setNewEvidenceDescription("");
  };

  return (
    <div className="card bg-secondary/30 mb-4">
      <div className="card-header">
        <h3 className="card-title text-base">Submit New Evidence</h3>
        <button
          className="btn btn-ghost btn-sm btn-icon absolute top-2 right-2"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Video URL</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              className="search-input w-full"
              value={newEvidenceUrl}
              onChange={(e) => setNewEvidenceUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              YouTube, Twitch clips, or other video hosting sites
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="Describe what happens in the video and at what timestamp the suspicious behavior occurs"
              className="search-input w-full min-h-[100px]"
              value={newEvidenceDescription}
              onChange={(e) => setNewEvidenceDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Evidence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
