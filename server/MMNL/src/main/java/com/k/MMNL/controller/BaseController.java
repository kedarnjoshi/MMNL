package com.k.MMNL.controller;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class BaseController {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;


    @GetMapping("/")
    public String root() {
        return "redirect:" + frontendUrl;
    }
}
