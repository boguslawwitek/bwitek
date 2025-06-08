# WARNING: I am including the .env.production file in this Docker image ONLY because I am using a private Docker registry.
# Do NOT use this approach for public registries or production environments, as it may expose sensitive information.

# docker build --no-cache -t gitea.yourdomain.com/yourusername/bwitek .
# docker push gitea.yourdomain.com/yourusername/bwitek

FROM oven/bun:latest

RUN apt -y update; apt -y install supervisor curl

RUN mkdir -p /bwitek && chown -R bun:bun /bwitek

WORKDIR /bwitek

COPY --chown=bun:bun . .
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

USER bun

RUN bun install

ENV TURBO_TELEMETRY_DISABLED 1
ENV NEXT_TELEMETRY_DISABLED 1
ENV SERVER_PORT 7770
ENV PORT 7771
ENV NODE_ENV production

RUN bun run build

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]