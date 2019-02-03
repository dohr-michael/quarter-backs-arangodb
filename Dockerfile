FROM golang:alpine as builder

ARG projectPath
ARG version
ARG commit
ARG buildTime

RUN apk update && apk add ca-certificates && mkdir -p /go/src/${projectPath}

WORKDIR /go/src/${projectPath}

COPY ./ .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
       -a -installsuffix cgo \
       -ldflags="-X ${projectPath}/cmd.BuildVersion=${version} -X ${projectPath}/cmd.BuildRevision=${commit} -X ${projectPath}/cmd.BuildTime=${buildTime} -w -s" \
       -o /go/bin/project && touch /go/bin/.config.yml

FROM scratch

COPY --from=builder /go/bin/project /project
COPY --from=builder /go/bin/.config.yml /.config.yml
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

CMD ["/project", "--config=/.config.yml", "start"]
