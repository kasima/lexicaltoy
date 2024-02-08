import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import { User, Page } from './definitions';

export async function fetchPages(userId: string) {
    noStore();
    const result = await sql`
      SELECT * FROM pages
      WHERE userId = ${userId}
    `;
    const pages = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      value: row.value,
      userId: row.userId,
      lastModified: row.last_modified,
    }));
  
    return pages;
  }