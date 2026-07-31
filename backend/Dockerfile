# ==========================================
# STAGE 1: Dependency builder environment
# ==========================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system compilation packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies into user directory (clean isolation)
RUN pip install --no-cache-dir --user -r requirements.txt

# ==========================================
# STAGE 2: Lightweight runtime environment
# ==========================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Install PostgreSQL runtime client libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python wheel structures from builder stage
COPY --from=builder /root/.local /root/.local
COPY . .

# Set execution PATH & environments
ENV PATH=/root/.local/bin:$PATH
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

# Start server using Gunicorn WSGI threads
CMD ["gunicorn", "-w", "4", "-k", "gthread", "--threads", "2", "-b", "0.0.0.0:5000", "app:app"]
