export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
  };
  
  export type Page = {
    id: string;
    value: string;
    userId: string;
    title: string;
    lastModified: Date;
    revisionNumber: number;
    isJournal: boolean;
    deleted: boolean;
    pendingWrite: boolean;
  }

  export function isPage(obj: any): obj is Page {
    return (
      obj &&
      typeof obj.id === 'string' &&
      typeof obj.title === 'string' &&
      typeof obj.value === 'string' &&
      typeof obj.userId === 'string' &&
      obj.lastModified instanceof Date
    );
  }

  export type SharedNode = {
    pageId: string;
    lineNumber: number;
    markdownContent: string;
    invalidated: boolean;
  }