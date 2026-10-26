using Application.Errors;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Contexts;
using Infrastructure.Persistence.Seeding;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<VagtplanDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentityCore<User>()
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<VagtplanDbContext>();

// Business roles are stored on User; there are no login/auth endpoints in this assignment.
builder.Services.AddScoped<IPeriodRepository, PeriodRepository>();
builder.Services.AddScoped<ISectionRepository, SectionRepository>();
builder.Services.AddScoped<IStaffGroupRepository, StaffGroupRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEmploymentRepository, EmploymentRepository>();

builder.Services.AddScoped<PeriodService>();
builder.Services.AddScoped<SectionService>();
builder.Services.AddScoped<StaffGroupService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<EmploymentService>();
builder.Services.AddScoped<PersonnelService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
                "https://localhost:5173",
                "https://127.0.0.1:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Return consistent ProblemDetails instead of leaking EF Core or application exceptions.
app.UseExceptionHandler(handler => handler.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    var (status, title) = exception switch
    {
        BusinessException { Error: ApplicationError.Validation } => (400, "Ugyldige oplysninger"),
        BusinessException { Error: ApplicationError.NotFound } => (404, "Ikke fundet"),
        BusinessException { Error: ApplicationError.Conflict } => (409, "Konflikt"),
        DbUpdateException => (409, "Data kunne ikke gemmes"),
        _ => (500, "Intern serverfejl")
    };

    context.Response.StatusCode = status;
    var problem = new ProblemDetails
    {
        Status = status,
        Title = title,
        Detail = status == 500
            ? "Der opstod en uventet fejl."
            : exception?.Message
    };
    await context.Response.WriteAsJsonAsync(problem, cancellationToken: context.RequestAborted);
}));

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Develop against a reproducible database; never auto-migrate in production.
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<VagtplanDbContext>();
    await db.Database.MigrateAsync();
    await SeedData.InitializeAsync(db);
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.MapControllers();
app.Run();

public partial class Program;
