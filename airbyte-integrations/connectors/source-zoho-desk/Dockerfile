FROM python:3.9-slim

RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*

ENV AIRBYTE_ENTRYPOINT "python /airbyte/integration_code/main.py"

WORKDIR /airbyte/integration_code

COPY setup.py ./

RUN pip install .

COPY source_zoho_desk ./source_zoho_desk
COPY main.py ./

ENTRYPOINT ["python", "/airbyte/integration_code/main.py"]

LABEL io.airbyte.version=0.1.45
LABEL io.airbyte.name=airbyte/source-zoho-desk