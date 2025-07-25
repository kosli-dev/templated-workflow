FROM ubuntu:24.04
LABEL maintainer="Sofus Albertsen <sofus@acme.com>"
EXPOSE 8080

ENTRYPOINT [ "echo", "Hello,, World!" ]