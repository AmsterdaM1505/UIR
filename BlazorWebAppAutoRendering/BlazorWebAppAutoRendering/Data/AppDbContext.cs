using BlazorWebAppAutoRendering.Models;
using Microsoft.EntityFrameworkCore;

namespace BlazorWebAppAutoRendering.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Diagram> Diagrams => Set<Diagram>();
}