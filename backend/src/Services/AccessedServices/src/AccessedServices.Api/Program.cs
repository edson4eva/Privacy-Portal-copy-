using AccessedServices;
using AccessedServices.Extensions.Infrastructure;
using AccessedServices.Middlewares;
using GoA.UiamRpClientLib.Authentication;
using GoA.UiamRpClientLib.Settings;
using Libs.Web;

Console.Title = "Accessed Services";

var builder = WebApplication.CreateBuilder(args);

#region uiam config
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddUserSecrets<Program>()
    .AddEnvironmentVariables();

var uiamSettings = builder.Configuration.GetSection("UiamSettings").Get<UiamSettings>() ?? new UiamSettings();
var defaultSpaUri = uiamSettings == null || string.IsNullOrWhiteSpace(uiamSettings.SpaUrl) ? "http://localhost:8888" : uiamSettings.SpaUrl;

var SiteRoot = uiamSettings.CleanSiteRoot;

builder.Services.AddUiam(uiamSettings);
builder.Services.AddControllers();
#endregion


builder.Host.UseDefaultServiceProvider((context, options) =>
{
    options.ValidateScopes = context.HostingEnvironment.IsDevelopment() || context.HostingEnvironment.IsStaging() || context.HostingEnvironment.IsEnvironment("tests");
    options.ValidateOnBuild = true;
});

builder.AddMinimalEndpoints(assemblies: typeof(AccessedServicesRoot).Assembly);
builder.AddInfrastructure();


var app = builder.Build();

app.UseMiddleware<PreviewModeMiddleware>();
app.UseCors();
app.UseHttpsRedirection();
app.UsePathBase(SiteRoot);
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();
app.UseInfrastructure();
app.UseUiamProtectedApp();
app.MapMinimalEndpoints();
app.UseRequestDecompression();

#region uiam handlers
// ensure the login/logout path exists, the handler is not really used. the event will be 
// handled by UIAM middleware.
app.MapGet(uiamSettings.LoginPath, () => { });
app.MapGet(uiamSettings.LogoutPath, () => { });
app.MapControllers();
#endregion

app.Run();

namespace AccessedServices.Api
{
    public partial class Program
    {

    }
}
