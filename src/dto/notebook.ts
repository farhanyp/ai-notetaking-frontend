export interface NoteFileResponse {
  original_name: string;
  url: string;
}

export interface GetAllNotebooksResponse {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string | null;
  notes: GetAllNotebookResponseNote[];
}

export interface GetAllNotebookResponseNote {
  id: string;
  title: string;
  content: string;
  created_at: string; // atau Date
  updated_at: string | null;
  files: NoteFileResponse[];
}

export interface CreateNotebooksRequest {
  name: string;
  parent_id: string | null;
}

export interface CreateNotebooksResponse {
  id: string;
}

export interface UpdateNotebooksRequest {
  name: string;
}

export interface UpdateNotebooksResponse {
  id: string;
}

export interface MoveNotebooksRequest {
  parent_id: string | null;
}

export interface UpdateNotebooksResponse {
  id: string;
}
