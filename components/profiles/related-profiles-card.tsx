import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { fetchRelatedProfilesData } from "@/app/profiles/actions";
import {
  RelatedProfileData,
  RelatedProfileIdentifier,
} from "@/lib/types/related_profiles";

// Props type: relatedProfiles is an array of identifiers from your JSONB field.
interface RelatedProfilesCardProps {
  relatedProfiles: RelatedProfileIdentifier[];
}

export default async function RelatedProfilesCard({
  relatedProfiles,
}: RelatedProfilesCardProps) {
  // Call our server action to resolve full profile data.
  // TODO: this is the next thing we need to cache. and do a lookup into our own DB.
  const relatedProfilesData: RelatedProfileData[] =
    await fetchRelatedProfilesData(relatedProfiles);

  // return <div>hello world</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Profiles</CardTitle>
        <CardDescription>
          Players frequently seen with this account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {relatedProfilesData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No related profiles found yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {relatedProfilesData.map((profile, index) => (
              <Card key={profile.name} className={"p-4"}>
                <CardContent className={"p-0"}>
                  <a
                    href={profile.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4"
                  >
                    <Image
                      src={profile.avatar_url}
                      alt={profile.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className={"flex flex-col w-full"}>
                      <p className="font-semibold">{profile.name}</p>
                      <p className="text-xs text-muted-foreground truncate w-full">
                        {profile.link}
                      </p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
