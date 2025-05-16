using BlazorWebAppAutoRendering.Components;
using Microsoft.AspNetCore.Mvc;
using MudBlazor.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Components;
using System.ComponentModel.DataAnnotations.Schema;

// ������� � ����������� ������� ���-����������
var builder = WebApplication.CreateBuilder(args);

// <- ������ ����������� �� appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("NIRdb")));


// ��������� ������� (WASM) �������� API
builder.Services.AddCors(o => o.AddPolicy("CorsPolicy",
    p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddControllers();      // ������� MVC-����������

// ��������� ������� � ��������� DI (Dependency Injection)
builder.Services.AddRazorComponents()                      // ��������� ��������� Razor �����������
    .AddInteractiveServerComponents()                      // ��������� ������������� ��������� ����������
    .AddInteractiveWebAssemblyComponents();                // ��������� ������������� ���������� ��� WebAssembly

builder.Services.AddCors();                                // ��������� ��������� CORS (Cross-Origin Resource Sharing)
builder.Services.AddControllers();                         // ��������� ��������� ������������ ��� API
builder.Services.AddMudServices();

builder.Services.AddScoped(sp => {
    // ��� ���������� ���������� ���� ������� URI �� NavigationManager
    var nav = sp.GetRequiredService<NavigationManager>();
    return new HttpClient { BaseAddress = new Uri(nav.BaseUri) };
});

// ������ ���-����������
var app = builder.Build();

// ������������� HTTP �������� ��� ��������� ��������
if (app.Environment.IsDevelopment())                       // ���� ���������� �������� � ������ ����������
{
    app.UseWebAssemblyDebugging();                         // �������� ��������� ������� WebAssembly
    app.UseDeveloperExceptionPage();
} else {                                                   // ���� ���������� �������� � ������ ������������
    app.UseExceptionHandler("/Error");                     // �������� ���������� ������
    app.UseHsts();                                         // �������� HSTS (HTTP Strict Transport Security) � ����������� �� ���������
}

app.UseHttpsRedirection();                                 // �������������� HTTP ������� �� HTTPS

app.UseStaticFiles();                                      // ����������� ����������� �����

app.UseRouting();                                          // �������� ������������� ��������
app.UseAntiforgery();                                      // �������� ������ �� CSRF ����
app.UseCors("AllowAllOrigins");                            // �������� CORS � ��������� "AllowAllOrigins"
app.UseCors("CorsPolicy");
app.MapFallbackToFile("index.html");


// ����������� ������������� ��� Razor �����������
app.MapRazorComponents<App>()                              // �������������� Razor ����������
    .AddInteractiveServerRenderMode()                      // ��������� ����� ���������� ��� ��������� �����������
    .AddInteractiveWebAssemblyRenderMode()                 // ��������� ����� ���������� ��� WebAssembly �����������
    .AddAdditionalAssemblies(typeof(BlazorWebAppAutoRendering.Client._Imports).Assembly);  // ��������� �������������� ������ ��� �����������

app.MapControllers();                                      // �������������� ����������� ��� ��������� API ��������

app.Run();                                                 // ��������� ���-���������� � �������� ������������ �������

// ���������� ���������� ��� ��������� �������� ������
// ���������� ������������ url /api/items ��� get, pos, put, delete
[Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
[Microsoft.AspNetCore.Mvc.ApiController]
public class UploadController(IWebHostEnvironment envir) : ControllerBase
{
    // ����� ��� ��������� POST �������� �� �������� CSS ������
    [HttpPost("upload-css")]
    public async Task<IActionResult> UploadCss(IFormFile file)
    {
        // ���������, ��� �� �������� ����
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }
        //var base_path = envir.WebRootPath;
        var base_path = envir.ContentRootPath;
        // ���������� ���� ��� ���������� �����
        var filePath = Path.Combine(base_path, "Components", "Layout", file.FileName);
        //var fileUrl = Path.Combine("/css", file.FileName).Replace("\\", "/");
        // ��������� ���� �� ������
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // ���������� ���� � ������������ ����� � ������
        return Ok(new { FilePath = filePath });
    }
}

namespace BlazorWebAppAutoRendering.Components.Controllers
{
    [ApiController] // ������� ������ ��� �����������.
    //��������� ������������ ���������������� �������, ������� �������� �������  � ���-API.
    //��������� �������� �������� ����� ��������� ����������, ������������� ��������� � �������� ���������� � ��������� ��������� ������ �������� ������
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")] //[Route] ���������� ������ ������������� [controller]
    //����� [controller] ������������� ��������� �� ��� �����������
    //��� ����� "Controller" � �� ����, ��������� /api/items
    public class ItemsController : ControllerBase // ����� ����������� �������� ���Contrioller 
    {
        private readonly AppDbContext _context; // ����������� ��� ������� � ��������� � PostgreSQL ����� Entity Framework

        public ItemsController(AppDbContext context) //����������� �����������
        {
            _context = context;
        }

        [HttpGet] //HTTP GET ������ �� ������ /api/items
        public async Task<ActionResult<List<Item>>> Get() => //Task<...> � ����������� �����
            await _context.Items.ToListAsync();              //ActionResult<List<Item>> � ������������ ��������� (�������� ��� ������)
                                                             //_context.Items � ������� items
                                                             //.ToListAsync() � ��������� ��� ������ � ���� ������

        [HttpPost] // HTTP POST ������ �� /api/items, ��������� Item �� ���� ������� � ��������� � ����
        public async Task<IActionResult> Post(Item item) //item � ��� ������ Item, �������� { "name": "����" }
        {
            _context.Items.Add(item); //.Add(item) � ��������� � ��������
            await _context.SaveChangesAsync(); //.SaveChangesAsync() � ��������� � ��
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item); // CreatedAtAction(...) � ���������� ����� 201 Created � ����� ����� ������
        }

        [HttpDelete("{id}")] //HTTP DELETE ������, �������� /api/items/3 (������� ������ �� ID)
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Items.FindAsync(id); //.FindAsync(id) � ���� ������ �� ���������� �����
            if (item == null) return NotFound();
            _context.Items.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent(); // NoContent() � ���������� HTTP 204 (�������, �� ��� ���� ������)
        }

        [HttpPut("{id}")] // HTTP PUT ������ �� /api/items/3 (��������� ������ � ��������� ID)
        public async Task<IActionResult> Put(int id, Item item)
        {
            if (id != item.Id) return BadRequest(); // if (id != item.Id) � ������ �� ������: ID � URL � ���� ������� ������ ���������
            _context.Entry(item).State = EntityState.Modified; // Entry(item).State = Modified � �������� ������ ��� "���������"
            await _context.SaveChangesAsync(); // SaveChangesAsync() � ��������� ���������
            return NoContent();
        }
    }
}
// ��� C#-������, ��������������� ������� items � ���� ������
// �������� [Table] � [Column] �������� ������� ���� � ������� � SQL
[Table("items")]
public class Item
{
    [Column("id")]
    public int Id { get; set; }
    [Column("name")]
    public string Name { get; set; } = string.Empty;
}

// ��� �����, ����� ������� EF Core �������� � �����
// DbSet < Item > � ������������� ������� items ��� ��������� ��������
public class AppDbContext : DbContext
{
    // ����������� ������, ����������, ����� EF ������� ������ AppDbContext
    // DbContextOptions<AppDbContext> � ��� ����� ����������, � ������� �����������: ������ �����������(ConnectionString), ��������� ����(PostgreSQL, SQL Server � �.�.)
    // : base(options) � ������� ��� ��������� � ������� ����� DbContext, ����� �� ����, ��� ������������ � ����
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    // DbSet<Item> � ��� ������������� ������� items � ���� ������

    public DbSet<Item> Items => Set<Item>(); // DbSet<Item> � ��� ������������� ������� items � ���� ������.
    // ����� ������������ ��������� �������� � �������(=>) ������ ����������: public DbSet<Item> Items { get; set; }
    // ��� ������������ �� ����, �� => ������ �������� "������ ��� ������", ��� ��������, ���� �� �� ����������� ��� ��������������.
    // ���� ���������� ������ �������� (��������, Diagram, User), �� ����� �������� ����� DbSet
    //public DbSet<Diagram> Diagrams => Set<Diagram>();
    //public DbSet<User> Users => Set<User>();
}
