"use client";

import { Button } from "../ui/button";
import { fetchPages } from '@/app/lib/db';
import { useState } from 'react';
import { getPageMarkdown } from "../lib/pages-helpers";
import { updatePageContentsWithHistory } from "../lib/actions";

export default function AdminPage() {
  const [userId, setUserId] = useState('');
  const [pageIds, setPageIds] = useState<string[]>([]);

  const convertAllToMarkdown = async (userid: string) => {
    const pages = await fetchPages(userid.trim(), true);
    let ids = [];
    for (const page of pages) {
      if (page.value.startsWith("{")) {
        const markdown = await getPageMarkdown(page);
        await updatePageContentsWithHistory(page.id, markdown, page.revisionNumber);
        ids.push(page.id + " converted");
      } else {
        ids.push(page.id + " is already in markdown");
      }
    }
    setPageIds(ids);
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await convertAllToMarkdown(userId);
  }

  return (
    <div className="flex justify-center items-center">
      <div className="relative w-full">
        <form
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
          />
          <Button className="m-4">
            <div>Convert all pages to Markdown</div>
          </Button>
        </form>
        <div>
          {pageIds.map(id => (
            <div key={id}>{id}</div>
          ))}
        </div>
      </div>
    </div>
  );
}