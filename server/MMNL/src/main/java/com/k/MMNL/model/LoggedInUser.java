package com.k.MMNL.model;

import org.springframework.security.oauth2.core.user.OAuth2User;

public class LoggedInUser {
    private String name;
    private String email;
    private String picture;
    private String sub;
    private boolean verified;

    private LoggedInUser(String name, String email, String picture, String sub, boolean verified) {
        this.name = name;
        this.email = email;
        this.picture = picture;
        this.sub = sub;
        this.verified = verified;
    }

    public LoggedInUser(OAuth2User oAuth2User) {
        this.name = oAuth2User.getAttribute("name");
        this.email = oAuth2User.getAttribute("email");
        this.picture = oAuth2User.getAttribute("picture");
        this.sub = oAuth2User.getAttribute("sub");
        this.verified = Boolean.TRUE.equals(oAuth2User.getAttribute("email_verified"));

    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPicture() {
        return picture;
    }

    public String getSub() {
        return sub;
    }

    public boolean isVerified() {
        return verified;
    }
}
