using Microsoft.Extensions.Configuration;
using Momentum.Api.Models;
using Momentum.Api.Services.Auth;
using Xunit;

namespace Momentum.Tests;

public class AuthTests
{
    [Fact]
    public void BcryptPasswordHasher_HashesAndVerifiesCorrectly()
    {
        var hasher = new BcryptPasswordHasher();
        var password = "SecureHackathonPassword123!";

        var hash = hasher.HashPassword(password);

        Assert.NotEmpty(hash);
        Assert.NotEqual(password, hash);
        Assert.True(hasher.VerifyPassword(password, hash));
        Assert.False(hasher.VerifyPassword("WrongPassword", hash));
    }

    [Fact]
    public void JwtService_GeneratesAndValidatesTokenWithClaims()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:SecretKey"] = "Super_Secret_Testing_Key_At_Least_32_Chars_Long!",
                ["Jwt:Issuer"] = "MomentumApi",
                ["Jwt:Audience"] = "MomentumWeb",
                ["Jwt:ExpiryDays"] = "1"
            })
            .Build();

        var jwt = new JwtService(config);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "dev@momentum.app",
            FullName = "Hackathon Developer"
        };

        var token = jwt.GenerateToken(user);
        Assert.False(string.IsNullOrWhiteSpace(token));

        var principal = jwt.ValidateToken(token);
        Assert.NotNull(principal);
        Assert.Equal(user.Email, principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value);
        Assert.Equal(user.Id.ToString(), principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
    }
}
