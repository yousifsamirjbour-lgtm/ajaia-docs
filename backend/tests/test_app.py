import pytest
from httpx import AsyncClient

ALICE = "alice@ajaia.ai"
BOB = "bob@ajaia.ai"
CHARLIE = "charlie@ajaia.ai"

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Verify health endpoint returns status ok and database connected."""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

@pytest.mark.asyncio
async def test_auth_header_required(client: AsyncClient):
    """Verify that requests without X-User-Email are rejected."""
    response = await client.get("/api/documents")
    assert response.status_code == 400
    assert "X-User-Email" in response.json()["detail"]

@pytest.mark.asyncio
async def test_document_lifecycle_persistence(client: AsyncClient):
    """Test full document lifecycle: create, read, rename, update content, verify persistence."""
    headers = {"X-User-Email": ALICE}

    # 1. Create document
    create_payload = {
        "title": "Roadmap 2026",
        "content": "<p>Initial roadmap draft</p>"
    }
    create_res = await client.post("/api/documents", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    doc = create_res.json()
    doc_id = doc["id"]
    assert doc["title"] == "Roadmap 2026"
    assert doc["content"] == "<p>Initial roadmap draft</p>"
    assert doc["owner_email"] == ALICE
    assert doc["is_owner"] is True

    # 2. Read document
    get_res = await client.get(f"/api/documents/{doc_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Roadmap 2026"

    # 3. Inline rename
    rename_res = await client.put(f"/api/documents/{doc_id}", json={"title": "Roadmap 2026 - Final"}, headers=headers)
    assert rename_res.status_code == 200
    assert rename_res.json()["title"] == "Roadmap 2026 - Final"

    # 4. Update content
    update_res = await client.put(f"/api/documents/{doc_id}", json={"content": "<p>Updated <strong>rich content</strong></p>"}, headers=headers)
    assert update_res.status_code == 200
    assert "<strong>rich content</strong>" in update_res.json()["content"]

    # 5. Verify persistence via fresh GET
    verify_res = await client.get(f"/api/documents/{doc_id}", headers=headers)
    assert verify_res.status_code == 200
    persisted = verify_res.json()
    assert persisted["title"] == "Roadmap 2026 - Final"
    assert "<strong>rich content</strong>" in persisted["content"]

@pytest.mark.asyncio
async def test_access_control_and_sharing(client: AsyncClient):
    """
    Test access control:
    - 403 unshared access
    - 404 missing document
    - 200 after share
    - shared user can view and edit
    - non-owner cannot share or delete
    - 403 after revoke
    """
    alice_headers = {"X-User-Email": ALICE}
    bob_headers = {"X-User-Email": BOB}
    charlie_headers = {"X-User-Email": CHARLIE}

    # Alice creates private doc
    create_res = await client.post(
        "/api/documents",
        json={"title": "Alice Secret", "content": "<p>Confidential</p>"},
        headers=alice_headers
    )
    doc_id = create_res.json()["id"]

    # Bob tries to access -> 403
    bob_get = await client.get(f"/api/documents/{doc_id}", headers=bob_headers)
    assert bob_get.status_code == 403

    # Non-existent doc -> 404
    missing_get = await client.get("/api/documents/non-existent-uuid", headers=alice_headers)
    assert missing_get.status_code == 404

    # Alice shares with Bob -> 200
    share_res = await client.post(
        f"/api/documents/{doc_id}/share",
        json={"email": BOB},
        headers=alice_headers
    )
    assert share_res.status_code == 200
    assert BOB in share_res.json()["shared_with"]

    # Bob accesses doc now -> 200
    bob_get_shared = await client.get(f"/api/documents/{doc_id}", headers=bob_headers)
    assert bob_get_shared.status_code == 200
    assert bob_get_shared.json()["is_owner"] is False

    # Bob can edit doc -> 200
    bob_edit = await client.put(
        f"/api/documents/{doc_id}",
        json={"content": "<p>Bob contributed here</p>"},
        headers=bob_headers
    )
    assert bob_edit.status_code == 200
    assert "<p>Bob contributed here</p>" in bob_edit.json()["content"]

    # Bob (non-owner) tries to share with Charlie -> 403
    bob_share_attempt = await client.post(
        f"/api/documents/{doc_id}/share",
        json={"email": CHARLIE},
        headers=bob_headers
    )
    assert bob_share_attempt.status_code == 403

    # Bob (non-owner) tries to delete doc -> 403
    bob_delete_attempt = await client.delete(f"/api/documents/{doc_id}", headers=bob_headers)
    assert bob_delete_attempt.status_code == 403

    # Charlie (unshared) tries to access -> 403
    charlie_get = await client.get(f"/api/documents/{doc_id}", headers=charlie_headers)
    assert charlie_get.status_code == 403

    # Alice revokes Bob's share -> 200
    revoke_res = await client.delete(f"/api/documents/{doc_id}/share/{BOB}", headers=alice_headers)
    assert revoke_res.status_code == 200
    assert BOB not in revoke_res.json()["shared_with"]

    # Bob tries to access after revoke -> 403
    bob_after_revoke = await client.get(f"/api/documents/{doc_id}", headers=bob_headers)
    assert bob_after_revoke.status_code == 403

@pytest.mark.asyncio
async def test_sharing_edge_cases(client: AsyncClient):
    """Test self-share, duplicate share, and invalid email validation."""
    headers = {"X-User-Email": ALICE}
    create_res = await client.post(
        "/api/documents",
        json={"title": "Team Memo"},
        headers=headers
    )
    doc_id = create_res.json()["id"]

    # Self-share -> 400
    self_share = await client.post(
        f"/api/documents/{doc_id}/share",
        json={"email": ALICE},
        headers=headers
    )
    assert self_share.status_code == 400

    # Invalid email format -> 400
    bad_email = await client.post(
        f"/api/documents/{doc_id}/share",
        json={"email": "not-an-email"},
        headers=headers
    )
    assert bad_email.status_code == 400

    # Share with Bob -> 200
    first_share = await client.post(
        f"/api/documents/{doc_id}/share",
        json={"email": BOB},
        headers=headers
    )
    assert first_share.status_code == 200

    # Duplicate share with Bob -> 400
    dup_share = await client.post(
        f"/api/documents/{doc_id}/share",
        json={"email": BOB},
        headers=headers
    )
    assert dup_share.status_code == 400

@pytest.mark.asyncio
async def test_document_import_success_and_validation(client: AsyncClient):
    """Test importing .md and .txt files, and rejecting invalid, empty, or oversized files."""
    headers = {"X-User-Email": ALICE}

    # 1. Valid Markdown import
    md_content = b"# Architecture Overview\n\n- Point 1\n- Point 2\n\n**Bold text**"
    files = {"file": ("architecture.md", md_content, "text/markdown")}
    md_res = await client.post("/api/documents/import", files=files, headers=headers)
    assert md_res.status_code == 201
    md_doc = md_res.json()
    assert md_doc["title"] == "architecture"
    assert "<h1>Architecture Overview</h1>" in md_doc["content"]
    assert "<li>Point 1</li>" in md_doc["content"]
    assert "<strong>Bold text</strong>" in md_doc["content"]

    # 2. Valid Plaintext import
    txt_content = b"Paragraph 1 line 1\nParagraph 1 line 2\n\nParagraph 2 line 1"
    files = {"file": ("notes.txt", txt_content, "text/plain")}
    txt_res = await client.post("/api/documents/import", files=files, headers=headers)
    assert txt_res.status_code == 201
    txt_doc = txt_res.json()
    assert txt_doc["title"] == "notes"
    assert "<p>Paragraph 1 line 1<br>Paragraph 1 line 2</p>" in txt_doc["content"]
    assert "<p>Paragraph 2 line 1</p>" in txt_doc["content"]

    # 3. Unsupported extension (.pdf) -> 400
    bad_ext_files = {"file": ("resume.pdf", b"%PDF-1.4 dummy", "application/pdf")}
    bad_ext_res = await client.post("/api/documents/import", files=bad_ext_files, headers=headers)
    assert bad_ext_res.status_code == 400
    assert "Unsupported file type" in bad_ext_res.json()["detail"]

    # 4. Empty file (0 bytes) -> 400
    empty_files = {"file": ("empty.md", b"", "text/markdown")}
    empty_res = await client.post("/api/documents/import", files=empty_files, headers=headers)
    assert empty_res.status_code == 400
    assert "empty" in empty_res.json()["detail"].lower()

    # 5. Non-UTF-8 bytes -> 400
    invalid_utf8_bytes = b"\xff\xfe\x00\x00Invalid UTF8"
    non_utf8_files = {"file": ("corrupt.txt", invalid_utf8_bytes, "text/plain")}
    non_utf8_res = await client.post("/api/documents/import", files=non_utf8_files, headers=headers)
    assert non_utf8_res.status_code == 400
    assert "UTF-8" in non_utf8_res.json()["detail"]

    # 6. File > 1 MB -> 413
    oversized_bytes = b"A" * (1024 * 1024 + 10)
    oversized_files = {"file": ("huge.txt", oversized_bytes, "text/plain")}
    oversized_res = await client.post("/api/documents/import", files=oversized_files, headers=headers)
    assert oversized_res.status_code == 413
    assert "1 MB" in oversized_res.json()["detail"]

@pytest.mark.asyncio
async def test_html_sanitization(client: AsyncClient):
    """Verify server-side sanitization strips <script> and dangerous attributes."""
    headers = {"X-User-Email": ALICE}

    malicious_html = """
    <h1>Clean Title</h1>
    <script>alert('XSS')</script>
    <p>Good content</p>
    <img src="x" onerror="evilCode()" />
    <a href="javascript:alert(1)">Click here</a>
    <a href="https://ajaia.ai">Safe link</a>
    <div onclick="badClick()">Clickable div</div>
    """

    res = await client.post(
        "/api/documents",
        json={"title": "Security Test", "content": malicious_html},
        headers=headers
    )
    assert res.status_code == 201
    sanitized = res.json()["content"]

    # Verify malicious tags and handlers are removed
    assert "<script>" not in sanitized
    assert "alert('XSS')" not in sanitized
    assert "onerror" not in sanitized
    assert "evilCode" not in sanitized
    assert "javascript:" not in sanitized
    assert "onclick" not in sanitized

    # Verify safe tags and links are preserved
    assert "<h1>Clean Title</h1>" in sanitized
    assert "<p>Good content</p>" in sanitized
    assert '<a href="https://ajaia.ai">Safe link</a>' in sanitized
