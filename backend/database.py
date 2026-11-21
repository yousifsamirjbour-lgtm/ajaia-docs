import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, func
from backend.models import Base, Document, DocumentShare

DEFAULT_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "ajaia_docs.db"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DEFAULT_DB_PATH}")

# Ensure sqlite URL starts with sqlite+aiosqlite://
if DATABASE_URL.startswith("sqlite:///"):
    DATABASE_URL = DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_db_if_empty()

async def seed_db_if_empty():
    async with AsyncSessionLocal() as session:
        # Check if documents exist
        result = await session.execute(select(func.count(Document.id)))
        count = result.scalar() or 0
        if count > 0:
            return  # Already seeded or has data

        # Seed initial documents
        doc1 = Document(
            id="doc-welcome-001",
            title="Welcome to Ajaia Docs",
            content="<h1>Welcome to Ajaia Docs</h1><p>This is your <strong>AI-native</strong> collaborative workspace for documents.</p><h2>Key Features</h2><ul><li><strong>Rich Text Editing:</strong> Bold, <em>italic</em>, <u>underline</u>, headings, and lists.</li><li><strong>Real-time Auto-save:</strong> Never lose a keystroke with debounced saves.</li><li><strong>Seamless Sharing:</strong> Share with teammates with granular permissions.</li><li><strong>Document Import:</strong> Upload <code>.md</code> and <code>.txt</code> files directly.</li></ul><p>Enjoy writing and collaborating!</p>",
            owner_email="alice@ajaia.ai"
        )
        share1 = DocumentShare(
            id="share-welcome-001",
            document_id="doc-welcome-001",
            user_email="bob@ajaia.ai"
        )

        doc2 = Document(
            id="doc-eng-002",
            title="Engineering Architecture Guidelines",
            content="<h1>Engineering Architecture Guidelines</h1><p>Our stack is built for <em>speed</em>, <strong>reliability</strong>, and clean abstractions.</p><h2>Core Principles</h2><ol><li>Keep dependencies minimal and trusted.</li><li>Enforce access controls server-side.</li><li>Sanitize all incoming content.</li></ol>",
            owner_email="bob@ajaia.ai"
        )
        share2_alice = DocumentShare(
            id="share-eng-alice-002",
            document_id="doc-eng-002",
            user_email="alice@ajaia.ai"
        )
        share2_charlie = DocumentShare(
            id="share-eng-charlie-002",
            document_id="doc-eng-002",
            user_email="charlie@ajaia.ai"
        )

        doc3 = Document(
            id="doc-design-003",
            title="Design System & Component Specs",
            content="<h1>Design System Specs</h1><p>Clean, accessible, and responsive typography guidelines for our application components.</p>",
            owner_email="charlie@ajaia.ai"
        )

        session.add_all([doc1, share1, doc2, share2_alice, share2_charlie, doc3])
        await session.commit()
