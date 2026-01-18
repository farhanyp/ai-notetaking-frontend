export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  files: { name: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteFile {
  name: string;
  url: string;
}
