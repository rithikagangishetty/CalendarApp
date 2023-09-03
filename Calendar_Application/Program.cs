using Main.Models;
using Main.Supervisor;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using CalendarDb;
using Serilog;
using SharpCompress.Common;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "ClientApp/build";
});

var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");
var logFilePath = Path.Combine(logDirectory, "Log-.log");

var logger = new LoggerConfiguration().MinimumLevel.Information()
    .WriteTo.File(logFilePath, rollingInterval: RollingInterval.Day)
    .CreateLogger();


builder.Logging.AddSerilog(logger);
builder.Services.AddScoped<ILoginSupervisor, LoginSupervisor>();
builder.Services.AddScoped<IUserSupervisor, UserSupervisor>();
builder.Services.AddScoped<IConnectionSupervisor, ConnectionSupervisor>();
builder.Services.AddScoped<IConnection, Connection>();
builder.Services.AddSingleton<Connection>();
builder.Services.AddScoped<IUser, User>();
builder.Services.AddSingleton<User>();
builder.Services.AddScoped<ILogin, Login>();
builder.Services.AddSingleton<Login>();

var app = builder.Build();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseSpaStaticFiles();
app.UseRouting();

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller}/{action=Index}/");
});
app.UseSpa(spa =>
{
    spa.Options.SourcePath = "ClientApp";

    if (app.Environment.IsDevelopment())
    {
        spa.UseReactDevelopmentServer(npmScript: "start");
    }
});
using (var scope = app.Services.CreateScope())
{
    var serviceProvider = scope.ServiceProvider;

    // Retrieve an instance of the User class
    var user = serviceProvider.GetRequiredService<IUser>();

    // Call the SetReminderTask method
    user.StartReminderTimer();
}
app.Run();

