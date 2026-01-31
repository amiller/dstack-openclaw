FROM node:22-slim

RUN apt-get update && \
    apt-get install -y wget && \
    npm install -g phala && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /root

CMD phala simulator start && tail -f /dev/null
