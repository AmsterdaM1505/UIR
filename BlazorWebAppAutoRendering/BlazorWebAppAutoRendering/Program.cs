using BlazorWebAppAutoRendering.Components;
using Microsoft.AspNetCore.Mvc;
using MudBlazor.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Components;
using System.ComponentModel.DataAnnotations.Schema;

// Создаем и настраиваем билдера веб-приложения
var builder = WebApplication.CreateBuilder(args);

// <- строка подключения из appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("NIRdb")));


// разрешаем клиенту (WASM) вызывать API
builder.Services.AddCors(o => o.AddPolicy("CorsPolicy",
    p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddControllers();      // добавим MVC-конроллеры

// Добавляем сервисы в контейнер DI (Dependency Injection)
builder.Services.AddRazorComponents()                      // Добавляем поддержку Razor компонентов
    .AddInteractiveServerComponents()                      // Добавляем интерактивные серверные компоненты
    .AddInteractiveWebAssemblyComponents();                // Добавляем интерактивные компоненты для WebAssembly

builder.Services.AddCors();                                // Добавляем поддержку CORS (Cross-Origin Resource Sharing)
builder.Services.AddControllers();                         // Добавляем поддержку контроллеров для API
builder.Services.AddMudServices();

builder.Services.AddScoped(sp => {
    // Для серверного рендеринга берём базовый URI из NavigationManager
    var nav = sp.GetRequiredService<NavigationManager>();
    return new HttpClient { BaseAddress = new Uri(nav.BaseUri) };
});

// Строим веб-приложение
var app = builder.Build();

// Конфигурируем HTTP конвейер для обработки запросов
if (app.Environment.IsDevelopment())                       // Если приложение запущено в режиме разработки
{
    app.UseWebAssemblyDebugging();                         // Включаем поддержку отладки WebAssembly
    app.UseDeveloperExceptionPage();
} else {                                                   // Если приложение запущено в режиме производства
    app.UseExceptionHandler("/Error");                     // Включаем обработчик ошибок
    app.UseHsts();                                         // Включаем HSTS (HTTP Strict Transport Security) с настройками по умолчанию
}

app.UseHttpsRedirection();                                 // Перенаправляем HTTP запросы на HTTPS

app.UseStaticFiles();                                      // Обслуживаем статические файлы

app.UseRouting();                                          // Включаем маршрутизацию запросов
app.UseAntiforgery();                                      // Включаем защиту от CSRF атак
app.UseCors("AllowAllOrigins");                            // Включаем CORS с политикой "AllowAllOrigins"
app.UseCors("CorsPolicy");
app.MapFallbackToFile("index.html");


// Настраиваем маршрутизацию для Razor компонентов
app.MapRazorComponents<App>()                              // Маршрутизируем Razor компоненты
    .AddInteractiveServerRenderMode()                      // Добавляем режим рендеринга для серверных компонентов
    .AddInteractiveWebAssemblyRenderMode()                 // Добавляем режим рендеринга для WebAssembly компонентов
    .AddAdditionalAssemblies(typeof(BlazorWebAppAutoRendering.Client._Imports).Assembly);  // Добавляем дополнительные сборки для компонентов

app.MapControllers();                                      // Маршрутизируем контроллеры для обработки API запросов

app.Run();                                                 // Запускаем веб-приложение и начинаем обрабатывать запросы

// Определяем контроллер для обработки загрузки файлов
// происходит обслуживание url /api/items для get, pos, put, delete
[Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
[Microsoft.AspNetCore.Mvc.ApiController]
public class UploadController(IWebHostEnvironment envir) : ControllerBase
{
    // Метод для обработки POST запросов на загрузку CSS файлов
    [HttpPost("upload-css")]
    public async Task<IActionResult> UploadCss(IFormFile file)
    {
        // Проверяем, был ли загружен файл
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }
        //var base_path = envir.WebRootPath;
        var base_path = envir.ContentRootPath;
        // Определяем путь для сохранения файла
        var filePath = Path.Combine(base_path, "Components", "Layout", file.FileName);
        //var fileUrl = Path.Combine("/css", file.FileName).Replace("\\", "/");
        // Сохраняем файл на сервер
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Возвращаем путь к загруженному файлу в ответе
        return Ok(new { FilePath = filePath });
    }
}

namespace BlazorWebAppAutoRendering.Components.Controllers
{
    [ApiController] // пометка класса как контроллера.
    //Позволяет использовать предопределенные подходы, которые упрощают создани  е веб-API.
    //Некоторые действия включают вывод источника параметров, маршрутизацию атрибутов в качестве требования и улучшения обработки ошибок проверки модели
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")] //[Route] определяет шаблон маршрутизации [controller]
    //Здесь [controller] автоматически заменится на имя контроллера
    //без слова "Controller" — то есть, получится /api/items
    public class ItemsController : ControllerBase // класс обязательно называем хххContrioller 
    {
        private readonly AppDbContext _context; // спользуется для общения с таблицами в PostgreSQL через Entity Framework

        public ItemsController(AppDbContext context) //конструктор контроллера
        {
            _context = context;
        }

        [HttpGet] //HTTP GET запрос по адресу /api/items
        public async Task<ActionResult<List<Item>>> Get() => //Task<...> — асинхронный метод
            await _context.Items.ToListAsync();              //ActionResult<List<Item>> — возвращаемый результат (успешный или ошибка)
                                                             //_context.Items — таблица items
                                                             //.ToListAsync() — загружает все строки в виде списка

        [HttpPost] // HTTP POST запрос на /api/items, Принимает Item из тела запроса и сохраняет в базу
        public async Task<IActionResult> Post(Item item) //item — это объект Item, например { "name": "Тест" }
        {
            _context.Items.Add(item); //.Add(item) — добавляет в контекст
            await _context.SaveChangesAsync(); //.SaveChangesAsync() — сохраняет в БД
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item); // CreatedAtAction(...) — возвращает ответ 201 Created с телом новой записи
        }

        [HttpDelete("{id}")] //HTTP DELETE запрос, например /api/items/3 (Удаляет запись по ID)
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Items.FindAsync(id); //.FindAsync(id) — ищет запись по первичному ключу
            if (item == null) return NotFound();
            _context.Items.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent(); // NoContent() — возвращает HTTP 204 (успешно, но без тела ответа)
        }

        [HttpPut("{id}")] // HTTP PUT запрос на /api/items/3 (Обновляет запись с указанным ID)
        public async Task<IActionResult> Put(int id, Item item)
        {
            if (id != item.Id) return BadRequest(); // if (id != item.Id) — защита от ошибок: ID в URL и теле запроса должны совпадать
            _context.Entry(item).State = EntityState.Modified; // Entry(item).State = Modified — помечает объект как "изменённый"
            await _context.SaveChangesAsync(); // SaveChangesAsync() — сохраняет изменения
            return NoContent();
        }
    }
}
// Это C#-объект, соответствующий таблице items в базе данных
// Атрибуты [Table] и [Column] помогают связать поля с именами в SQL
[Table("items")]
public class Item
{
    [Column("id")]
    public int Id { get; set; }
    [Column("name")]
    public string Name { get; set; } = string.Empty;
}

// Это класс, через который EF Core работает с базой
// DbSet < Item > — представление таблицы items как коллекции объектов
public class AppDbContext : DbContext
{
    // конструктор класса, вызывается, когда EF создает объект AppDbContext
    // DbContextOptions<AppDbContext> — это набор параметров, в котором указывается: строка подключения(ConnectionString), провайдер базы(PostgreSQL, SQL Server и т.д.)
    // : base(options) — передаёт эти параметры в базовый класс DbContext, чтобы он знал, как подключаться к базе
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    // DbSet<Item> — это представление таблицы items в базе данных

    public DbSet<Item> Items => Set<Item>(); // DbSet<Item> — это представление таблицы items в базе данных.
    // Здесь используется синтаксис свойства с лямбдой(=>) вместо привычного: public DbSet<Item> Items { get; set; }
    // Они эквивалентны по сути, но => делает свойство "только для чтения", что подходит, если ты не собираешься его переопределять.
    // Если пояоявятся другие сущности (например, Diagram, User), то нужно добавить новые DbSet
    //public DbSet<Diagram> Diagrams => Set<Diagram>();
    //public DbSet<User> Users => Set<User>();
}
