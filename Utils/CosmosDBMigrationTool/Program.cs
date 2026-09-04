using CosmosDBMigrationTool;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

try
{
    var host = CreateHostBuilder(args).Build();
    var application = host.Services.GetRequiredService<Application>();

    await application.Run();

    static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
        .ConfigureAppConfiguration((context, config) =>
        {
            config.SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .AddJsonFile($"appsettings.Development.json", optional: true, reloadOnChange: true);
        })
        .ConfigureServices((context, services) =>
        {
            services.AddSingleton<Application>();
            services.AddSingleton<IMigrationService, MigrationService>();
        });
}
catch(InvalidOperationException e)
{
    Console.WriteLine(e.Message);
    Console.ReadLine();
}
catch (Exception e)
{
    Console.WriteLine(e);
    Console.ReadLine();
}