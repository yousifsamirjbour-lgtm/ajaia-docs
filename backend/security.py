import nh3
from fastapi import Header, HTTPException, status
from backend.schemas import validate_email_format

ALLOWED_TAGS = {
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "b", "i", "strong", "em", "u", "s", "strike",
    "ul", "ol", "li",
    "blockquote", "code", "pre", "hr", "br",
    "a", "span", "sub", "sup"
}

ALLOWED_ATTRIBUTES = {
    "a": {"href", "title", "target", "rel"},
    "*": {"class"}
}

ALLOWED_URL_SCHEMES = {"http", "https", "mailto"}

def sanitize_html(html_content: str) -> str:
    """
    Sanitize HTML string to prevent XSS attacks while preserving formatting.
    Strips script tags, event handlers, and unsafe iframe/object embeddings.
    """
    if not html_content:
        return "<p></p>"
    return nh3.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        url_schemes=ALLOWED_URL_SCHEMES,
        link_rel=None
    )

def get_current_user_email(x_user_email: str = Header(None, alias="X-User-Email")) -> str:
    """
    Extracts and validates current user email from the X-User-Email header.
    Rejects missing or invalid email headers with HTTP 400.
    """
    if not x_user_email or not x_user_email.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required X-User-Email header"
        )
    try:
        return validate_email_format(x_user_email)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid X-User-Email header: {str(e)}"
        )
