# Technical Notes on Document Synchronization

Here is an architectural breakdown of document synchronization:

1. **Storage format**: Structured HTML with server-side allowlist sanitization.
2. **Access Control**: Header-enforced permissions (`X-User-Email`).
3. **Save Strategies**:
   - Debounced automatic save on keystrokes (1200ms).
   - Instant manual save triggered via `Ctrl+S` or toolbar button.

> "Simplicity and determinism are the foundation of reliable distributed systems."
