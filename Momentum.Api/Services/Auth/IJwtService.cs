using System.Security.Claims;
using Momentum.Api.Models;

namespace Momentum.Api.Services.Auth;

public interface IJwtService
{
    string GenerateToken(User user);
    ClaimsPrincipal? ValidateToken(string token);
}
