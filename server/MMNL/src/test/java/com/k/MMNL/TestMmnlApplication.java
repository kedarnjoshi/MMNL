package com.k.MMNL;

import org.springframework.boot.SpringApplication;

public class TestMmnlApplication {

	public static void main(String[] args) {
		SpringApplication.from(MmnlApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
