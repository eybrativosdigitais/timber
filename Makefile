TIMBER ?= starlight-timber-base

build:
	docker build -t $(TIMBER):latest ./merkle-tree

build-multiarch:
	docker buildx build \
		--platform linux/arm64,linux/amd64 \
		--label "org.opencontainers.image.source=https://github.com/eybrativosdigitais/timber" \
		--tag $(TIMBER):latest ./merkle-tree

push: build-multiarch
	docker tag $(TIMBER):latest ghcr.io/eybrativosdigitais/$(TIMBER):latest
	docker tag $(TIMBER):latest ghcr.io/eybrativosdigitais/$(TIMBER):$(TAG)
	docker push ghcr.io/eybrativosdigitais/$(TIMBER):latest
	docker push ghcr.io/eybrativosdigitais/$(TIMBER):$(TAG)

scan:
	snyk container test --docker $(TIMBER):latest --file=./merkle-tree/Dockerfile --platform=linux/arm64
