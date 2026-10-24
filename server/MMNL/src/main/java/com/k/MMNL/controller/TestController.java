package com.k.MMNL.controller;

import com.k.MMNL.model.AppUser;
import com.k.MMNL.model.LoggedInUser;
import com.k.MMNL.service.AppUserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TestController {

    private final AppUserService appUserService;

    private final String superAdminEmail;

    public TestController(AppUserService appUserService, @Value("${app.super-admin-email}") String superAdminEmail) {
        this.appUserService = appUserService;
        this.superAdminEmail = superAdminEmail;
    }

    @GetMapping("/api/me")
    public ResponseEntity<Map<String, String>> me(@AuthenticationPrincipal OAuth2User user) {
        if  (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String sub = user.getAttribute("sub");
        String email = user.getAttribute("email");
        boolean verified = Boolean.TRUE.equals(user.getAttribute("email_verified"));
        String name = user.getAttribute("name");
        String picture = user.getAttribute("picture");

        LoggedInUser loggedInUser = new LoggedInUser(user);


        if (!appUserService.containsUser(loggedInUser.getSub())) {
            AppUser u = new AppUser(email, sub, name, picture);
            appUserService.addUser(u);

            if (verified && u.getEmail().trim().equals("kedarnjoshi2020@gmail.com")) appUserService.grantSuperAdmin(u.getId());
        }
        return ResponseEntity.ok(Map.of(
                "firstName", loggedInUser.getName(),
                "email", loggedInUser.getEmail()
        ));
    }
}
