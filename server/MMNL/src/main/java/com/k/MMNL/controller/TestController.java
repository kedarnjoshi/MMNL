package com.k.MMNL;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TestController {
    @GetMapping("/api/me")
    public ResponseEntity<Map<String, String>> me(@AuthenticationPrincipal OAuth2User user) {
        if  (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        return ResponseEntity.ok(Map.of("firstName", user.getAttribute("given_name"), "email", user.getAttribute("email")));
    }
}
