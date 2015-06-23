.PHONY: nacl all

current_dir=$(shell pwd)
nacl_builder_image=schibum/castify-naclbuilder:1.6

all: | setup nacl

help:
	$(info Build scripts for Libcastify)
	$(info ########################################## )
	$(info * Run `make` to do everything )
	$(info * Run `make nacl` to build libcastify code )

setup:
	docker pull $(nacl_builder_image)

nacl:
	$(info ###################### )
	$(info # Building NACL Code # )
	$(info ###################### )
	$(info )
	docker run -it --rm -v $(current_dir)/external/libcastify:/root/libcastify $(nacl_builder_image) \
		/bin/bash -c "cd /root/libcastify && make"

