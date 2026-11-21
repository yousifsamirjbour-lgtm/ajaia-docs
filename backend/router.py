import html
import os
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
import markdown

from backend.database import get_db
from backend.models import Document, DocumentShare
from backend.schemas import (
    DocumentCreate,
    DocumentUpdate,
    DocumentDetail,
    DocumentListResponse,
    DocumentSummary,
    ShareCreate,
    HealthResponse,
    validate_email_format,
)
from backend.security import get_current_user_email, sanitize_html

router = APIRouter(prefix="/api")

MAX_FILE_SIZE = 1024 * 1024  # 1 MB

@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check verifying API responsiveness and database connectivity."""
    try:
        await db.execute(select(1))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return HealthResponse(status="ok", database=db_status)

@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    current_user: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """
    List all documents accessible to the active user, split into:
    - my_documents: Documents owned by the current user.
    - shared_documents: Documents shared with the current user.
    """
    # 1. Fetch owned documents
    stmt_owned = (
        select(Document)
        .where(Document.owner_email == current_user)
        .options(selectinload(Document.shares))
        .order_by(Document.updated_at.desc())
    )
    result_owned = await db.execute(stmt_owned)
    owned_docs = result_owned.scalars().all()

    # 2. Fetch shared documents
    stmt_shared = (
        select(Document)
        .join(DocumentShare, Document.id == DocumentShare.document_id)
        .where(DocumentShare.user_email == current_user)
        .options(selectinload(Document.shares))
        .order_by(Document.updated_at.desc())
    )
    result_shared = await db.execute(stmt_shared)
    shared_docs = result_shared.scalars().all()

    my_summaries = [
        DocumentSummary(
            id=d.id,
            title=d.title,
            owner_email=d.owner_email,
            is_owner=True,
            shared_count=len(d.shares),
            shared_with=[s.user_email for s in d.shares],
            created_at=d.created_at,
            updated_at=d.updated_at
        )
        for d in owned_docs
    ]

    shared_summaries = [
        DocumentSummary(
            id=d.id,
            title=d.title,
            owner_email=d.owner_email,
            is_owner=False,
            shared_count=len(d.shares),
            shared_with=[s.user_email for s in d.shares],
            created_at=d.created_at,
            updated_at=d.updated_at
        )
        for d in shared_docs
    ]

    return DocumentListResponse(
        my_documents=my_summaries,
        shared_documents=shared_summaries
    )

@router.post("/documents", response_model=DocumentDetail, status_code=status.HTTP_201_CREATED)
async def create_document(
    doc_in: DocumentCreate,
    current_user: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """Create a new document owned by the active user."""
    clean_content = sanitize_html(doc_in.content)
    now = datetime.now(timezone.utc)
    new_doc = Document(
        title=doc_in.title,
        content=clean_content,
        owner_email=current_user,
        created_at=now,
        updated_at=now
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)

    return DocumentDetail(
        id=new_doc.id,
        title=new_doc.title,
        content=new_doc.content,
        owner_email=new_doc.owner_email,
        is_owner=True,
        shared_with=[],
        created_at=new_doc.created_at,
        updated_at=new_doc.updated_at
    )

@router.get("/documents/{document_id}", response_model=DocumentDetail)
async def get_document(
    document_id: str,
    current_user: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """
    Get document by ID. Enforces read authorization:
    - 404 if not found
    - 403 if user is not owner and document is not shared with user
    """
    stmt = (
        select(Document)
        .where(Document.id == document_id)
        .options(selectinload(Document.shares))
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    is_owner = (doc.owner_email == current_user)
    shared_users = [s.user_email for s in doc.shares]
    is_shared = current_user in shared_users

    if not is_owner and not is_shared:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this document"
        )

    return DocumentDetail(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        owner_email=doc.owner_email,
        is_owner=is_owner,
        shared_with=shared_users,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )

@router.put("/documents/{document_id}", response_model=DocumentDetail)
async def update_document(
    document_id: str,
    doc_in: DocumentUpdate,
    current_user: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """
    Update document title or content.
    Allowed for both document owner and shared users.
    Enforces server-side HTML sanitization on content.
    """
    stmt = (
        select(Document)
        .where(Document.id == document_id)
        .options(selectinload(Document.shares))
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    is_owner = (doc.owner_email == current_user)
    shared_users = [s.user_email for s in doc.shares]
    if not is_owner and current_user not in shared_users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this document"
        )

    if doc_in.title is not None:
        doc.title = doc_in.title
    if doc_in.content is not None:
        doc.content = sanitize_html(doc_in.content)

    doc.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(doc)

    return DocumentDetail(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        owner_email=doc.owner_email,
        is_owner=is_owner,
        shared_with=shared_users,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete document. Owner only.
    - 404 if not found
    - 403 if caller is not the owner
    """
    stmt = (
        select(Document)
        .where(Document.id == document_id)
        .options(selectinload(Document.shares))
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    if doc.owner_email != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the document owner can delete this document"
        )

    await db.delete(doc)
    await db.commit()
    return {"detail": "Document deleted successfully"}

@router.post("/documents/{document_id}/share")
async def share_document(
    document_id: str,
    share_in: ShareCreate,
    current_user: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """
    Share document with another user by email. Owner only.
    - 404 if document not found
    - 403 if caller is not owner
    - 400 if sharing with oneself or duplicate share
    """
    stmt = (
        select(Document)
        .where(Document.id == document_id)
        .options(selectinload(Document.shares))
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    if doc.owner_email != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the document owner can share this document"
        )

    try:
        target_email = validate_email_format(share_in.email)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    if target_email == current_user.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot share document with yourself"
        )

    existing_shares = [s.user_email.lower() for s in doc.shares]
    if target_email in existing_shares:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document is already shared with this email"
        )

    new_share = DocumentShare(
        document_id=doc.id,
        user_email=target_email
    )
    db.add(new_share)
    await db.commit()

    # Re-fetch updated shares
    updated_stmt = (
        select(DocumentShare)
        .where(DocumentShare.document_id == document_id)
    )
    updated_res = await db.execute(updated_stmt)
    shares = updated_res.scalars().all()

    return {
        "detail": f"Document shared with {target_email}",
        "shared_with": [s.user_email for s in shares]
    }

@router.delete("/documents/{document_id}/share/{email}")
async def revoke_document_share(
    document_id: str,
    email: str,
    current_user: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """
    Revoke a document share. Owner only.
    - 404 if document or share not found
    - 403 if caller is not owner
    """
    target_email = validate_email_format(email)

    stmt = (
        select(Document)
        .where(Document.id == document_id)
        .options(selectinload(Document.shares))
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    if doc.owner_email != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the document owner can revoke shares"
        )

    share_to_remove = None
    for s in doc.shares:
        if s.user_email.lower() == target_email:
            share_to_remove = s
            break

    if not share_to_remove:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document is not shared with this email"
        )

    await db.delete(share_to_remove)
    await db.commit()

    # Re-fetch updated shares
    updated_stmt = (
        select(DocumentShare)
        .where(DocumentShare.document_id == document_id)
    )
    updated_res = await db.execute(updated_stmt)
    shares = updated_res.scalars().all()

    return {
        "detail": f"Revoked share for {target_email}",
        "shared_with": [s.user_email for s in shares]
    }

@router.post("/documents/import", response_model=DocumentDetail, status_code=status.HTTP_201_CREATED)
async def import_document(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """
    Import .md or .txt file as a new document owned by active user.
    Validations:
    - Supported extensions (.md, .txt) -> 400
    - File size <= 1 MB -> 413
    - Non-empty -> 400
    - Valid UTF-8 -> 400
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload"
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".md", ".txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Supported types are .md and .txt."
        )

    # Read file content safely with size limit checking
    raw_content = await file.read(MAX_FILE_SIZE + 1)
    if len(raw_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE if hasattr(status, "HTTP_413_CONTENT_TOO_LARGE") else 413,
            detail="File size exceeds the 1 MB limit."
        )

    if len(raw_content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # UTF-8 decoding
    try:
        text_content = raw_content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File contains invalid non-UTF-8 characters. Only UTF-8 encoded files are supported."
        )

    # Convert to HTML based on file type
    if ext == ".md":
        raw_html = markdown.markdown(
            text_content,
            extensions=["extra", "sane_lists"]
        )
    else:  # .txt
        escaped_text = html.escape(text_content)
        # Split by double newline for paragraphs, single newline for <br>
        paragraphs = escaped_text.split("\n\n")
        html_parts = []
        for p in paragraphs:
            trimmed = p.strip()
            if trimmed:
                with_breaks = trimmed.replace("\n", "<br/>")
                html_parts.append(f"<p>{with_breaks}</p>")
        raw_html = "".join(html_parts) or "<p></p>"

    clean_content = sanitize_html(raw_html)

    # Generate document title from filename
    base_name = os.path.splitext(file.filename)[0].strip()
    if not base_name:
        base_name = "Imported Document"
    title = base_name[:200]

    now = datetime.now(timezone.utc)
    new_doc = Document(
        title=title,
        content=clean_content,
        owner_email=current_user,
        created_at=now,
        updated_at=now
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)

    return DocumentDetail(
        id=new_doc.id,
        title=new_doc.title,
        content=new_doc.content,
        owner_email=new_doc.owner_email,
        is_owner=True,
        shared_with=[],
        created_at=new_doc.created_at,
        updated_at=new_doc.updated_at
    )
