using UIAMData;
using Libs.Web;
using UIAMData.Extensions.Infrastructure;

Console.Title = "UIAM Data";

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseDefaultServiceProvider((context, options) =>
{
    options.ValidateScopes = context.HostingEnvironment.IsDevelopment() || context.HostingEnvironment.IsStaging() || context.HostingEnvironment.IsEnvironment("tests");
    options.ValidateOnBuild = true;
});

builder.AddMinimalEndpoints(assemblies: typeof(UIAMDataRoot).Assembly);
builder.AddInfrastructure();

var app = builder.Build();
app.MapMinimalEndpoints();
app.UseAuthentication();
app.UseAuthorization();
app.UseInfrastructure();

app.Run();

namespace UIAMData.Api
{
    public partial class Program
    {
    }
}
