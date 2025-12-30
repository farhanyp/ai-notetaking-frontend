export interface GetAllNotebooksResponse {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: Date;
    updated_at: Date | null;
    notes: GetAllNotebookResponseNote[];
}

export interface GetAllNotebookResponseNote {
    id: string;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date | null;
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