"use client";
import React, { FC } from "react";
import linkifyHtml from "linkify-html";
import DOMPurify from "dompurify";

interface CommentContentProps {
  content: string;
}

export const CommentContent: FC<CommentContentProps> = ({ content }) => {
  const dirty = linkifyHtml(content, {
    defaultProtocol: "https",
    target: "_blank",
  });

  const safeHTML = DOMPurify.sanitize(dirty);

  return (
    <p
      className={"text-sm whitespace-pre-wrap dangerLink"}
      dangerouslySetInnerHTML={{ __html: safeHTML }}
    />
  );
};
