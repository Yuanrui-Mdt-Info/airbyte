FROM python:3.9-slim

RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*

ENV AIRBYTE_ENTRYPOINT "python /airbyte/integration_code/main.py"

WORKDIR /airbyte/integration_code
RUN pip install --upgrade pip

COPY setup.py ./
RUN pip install .


COPY source_google_ads ./source_google_ads
COPY main.py ./

ENTRYPOINT ["python", "/airbyte/integration_code/main.py"]

LABEL io.airbyte.version=0.1.45
LABEL io.airbyte.name=yuanrui2014/source-google-ads
