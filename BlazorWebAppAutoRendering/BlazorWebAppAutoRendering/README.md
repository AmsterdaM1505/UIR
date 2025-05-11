# Blazor + PostgreSQL: Easy Local Dev Setup

Here’s a quick n’ easy guide to get your Blazor WebApp hooked up with PostgreSQL using Docker Compose and EF Core.

---

## What You Need

B4 u start:
Install dat shiet:
- .NET SDK 8.0+
- Docker & Docker Compose
- Optional: EF Core CLI for migrations

### Need EF tools? Run this:
dotnet tool install --global dotnet-ef

---

## How Stuff’s Organized
```
    UIR/
    ├── Config/
    │   ├── appsettings.json           # DB connection info
    │   ├── appsettings.Development.json
    │   └── init.sql                   # SQL to set up tables
    ├── docker-compose.yml            # PostgreSQL container setup
    ├── BlazorWebAppAutoRendering/
    │   ├── Program.cs                 # App startup stuff  
    │   ├── Data/
    │   │   └── AppDbContext.cs        # EF Core context
    │   ├── Models/
    │   │   ├── Item.cs                # Example item entity
    │   │   └── Diagram.cs             # Diagram entity for schemas
    │   ├── Controllers/
    │   │   ├── ItemsController.cs     # REST API for items
    │   │   └── DiagramsController.cs  # REST API for diagrams
    └── BlazorWebAppAutoRendering.Client/
```
---

## DB Setup (dw, it's ez)
```
docker-compose.yml:
services:
  postgres:
    image: postgres:15-alpine
    container_name: nir_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123456
      POSTGRES_DB: NIRdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./Config/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  pgdata:
```
---

Config/init.sql:
```
CREATE TABLE IF NOT EXISTS diagrams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    schema TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);
```
---

Config/appsettings.json:
```
{
  "ConnectionStrings": {
    "NIRdb": "Host=localhost;Port=5432;Database=NIRdb;Username=postgres;Password=123456"
  },
  "AllowedHosts": "*"
}
```
---

## Gettin' Started

1. Fire up the PostgreSQL container:
```docker-compose up -d```

2. Run the Blazor app:
```dotnet run --project BlazorWebAppAutoRendering```

3. Test the APIs:
```
GET    /api/items
POST   /api/items
DELETE /api/items/{id}
POST   /api/diagrams
```
---

## How it Works

- PostgreSQL runs inside a Docker container using your compose file.
- On first launch, `init.sql` creates the tables you need.
- Your app hooks up using `appsettings.json`.
- EF Core’s `AppDbContext` handles all the DB mapping.
- Controllers give you REST endpoints to CRUD your data.

---

## CRUD Example (Diagrams)

Diagram.cs:
```
[Table("diagrams")]
public class Diagram {
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("schema")]
    public string Schema { get; set; }
}
```
DiagramsController.cs:
```
[ApiController]
[Route("api/[controller]")]
public class DiagramsController : ControllerBase {
    private readonly AppDbContext _context;
    public DiagramsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<List<Diagram>>> Get() =>
        await _context.Diagrams.ToListAsync();

    [HttpPost]
    public async Task<IActionResult> Post(Diagram diagram) {
        _context.Diagrams.Add(diagram);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = diagram.Id }, diagram);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) {
        var d = await _context.Diagrams.FindAsync(id);
        if (d == null) return NotFound();
        _context.Diagrams.Remove(d);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
```
---

## Migrations (if u skip init.sql)
```
dotnet ef migrations add InitialCreate --project BlazorWebAppAutoRendering
dotnet ef database update --project BlazorWebAppAutoRendering
```
---

## Quick Tips

- Don’t mix `init.sql` and migrations — pick one way.
- Volumes (`pgdata`) keep your DB safe even if container stops.
- Wanna reset everything?
docker-compose down -v

---

## Troubleshoot Stuff

  - DB won’t connect?
  - Make sure Docker’s running.
  - Check port `5432` isn’t blocked.
  - Try connecting manually:
    psql -h localhost -U postgres -d NIRdb

---

## TL;DR

You've got:

- Postgres running locally in Docker
- Auto-created DB schema
- .NET 8 Blazor + EF Core with DB hookup
- Clean structure for easy dev

## P.S. I didn't touch any shit u wrote client-side. GL BTW.
