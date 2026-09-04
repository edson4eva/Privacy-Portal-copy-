using EServicesData;
using EServicesData.Extensions.Infrastructure;
using Libs.Web;

Console.Title = "EService Data";

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseDefaultServiceProvider((context, options) =>
{
    options.ValidateScopes = context.HostingEnvironment.IsDevelopment() || context.HostingEnvironment.IsStaging() || context.HostingEnvironment.IsEnvironment("tests");
    options.ValidateOnBuild = true;
});

builder.AddMinimalEndpoints(assemblies: typeof(EServicesDataRoot).Assembly);
builder.AddInfrastructure();

var app = builder.Build();
app.MapMinimalEndpoints();
app.UseAuthentication();
app.UseAuthorization();
app.UseInfrastructure();

app.Run();

namespace EServicesData.Api
{
    public partial class Program
    {
    }
}

