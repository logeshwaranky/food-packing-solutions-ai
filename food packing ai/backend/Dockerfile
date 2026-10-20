FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run dataset importer on container startup if DB not found
CMD ["sh", "-c", "python -m app.database.import_dataset && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
