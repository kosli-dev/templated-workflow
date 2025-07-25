FROM ubuntu:24.04
LABEL maintainer="Sofus Albertsen <sofus@acme.com>"
EXPOSE 8081

ENTRYPOINT [ "echo", "Hello,, World!" ]