// AI assisted development
package com.medexjob.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.medexjob.entity.User;

import java.io.IOException;

public class UserRoleDeserializer extends JsonDeserializer<User.UserRole> {
    
    @Override
    public User.UserRole deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return User.UserRole.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new IOException("Invalid role: " + value + ". Valid roles are: CANDIDATE, EMPLOYER, ADMIN", e);
        }
    }
}



