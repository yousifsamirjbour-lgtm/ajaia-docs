import re
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def validate_email_format(email: str) -> str:
    cleaned = email.strip().lower()
    if not EMAIL_REGEX.match(cleaned):
        raise ValueError("Invalid email format")
    return cleaned

class DocumentCreate(BaseModel):
    title: str = Field(default="Untitled Document", max_length=200)
    content: str = Field(default="<p></p>")

    @field_validator("title")
    @classmethod
    def clean_title(cls, v: str) -> str:
        s = v.strip()
        if not s:
            return "Untitled Document"
        if len(s) > 200:
            raise ValueError("Title cannot exceed 200 characters")
        return s

class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None

    @field_validator("title")
    @classmethod
    def clean_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        s = v.strip()
        if not s:
            raise ValueError("Title cannot be empty")
        if len(s) > 200:
            raise ValueError("Title cannot exceed 200 characters")
        return s

class ShareCreate(BaseModel):
    email: str

class ShareResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    document_id: str
    user_email: str
    created_at: datetime

class DocumentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    owner_email: str
    is_owner: bool
    shared_count: int
    shared_with: List[str] = []
    created_at: datetime
    updated_at: datetime

class DocumentDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    content: str
    owner_email: str
    is_owner: bool
    shared_with: List[str] = []
    created_at: datetime
    updated_at: datetime

class DocumentListResponse(BaseModel):
    my_documents: List[DocumentSummary]
    shared_documents: List[DocumentSummary]

class HealthResponse(BaseModel):
    status: str
    database: str
