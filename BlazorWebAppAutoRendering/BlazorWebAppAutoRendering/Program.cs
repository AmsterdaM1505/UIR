// Подключаем необходимые пространства имен
using BlazorWebAppAutoRendering.Client.Pages;
using BlazorWebAppAutoRendering.Components;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

// Создаем и настраиваем билдера веб-приложения
var builder = WebApplication.CreateBuilder(args);

// Добавляем сервисы в контейнер DI (Dependency Injection)
builder.Services.AddRazorComponents()                      // Добавляем поддержку Razor компонентов
    .AddInteractiveServerComponents()                      // Добавляем интерактивные серверные компоненты
    .AddInteractiveWebAssemblyComponents();                // Добавляем интерактивные компоненты для WebAssembly

builder.Services.AddCors();                                // Добавляем поддержку CORS (Cross-Origin Resource Sharing)
builder.Services.AddControllers();                         // Добавляем поддержку контроллеров для API

// Строим веб-приложение
var app = builder.Build();

// Конфигурируем HTTP конвейер для обработки запросов
if (app.Environment.IsDevelopment())                       // Если приложение запущено в режиме разработки
{
    app.UseWebAssemblyDebugging();                         // Включаем поддержку отладки WebAssembly
}
else                                                       // Если приложение запущено в режиме производства
{
    app.UseExceptionHandler("/Error");                     // Включаем обработчик ошибок
    app.UseHsts();                                         // Включаем HSTS (HTTP Strict Transport Security) с настройками по умолчанию
}

app.UseHttpsRedirection();                                 // Перенаправляем HTTP запросы на HTTPS

app.UseStaticFiles();                                      // Обслуживаем статические файлы

app.UseRouting();                                          // Включаем маршрутизацию запросов
app.UseAntiforgery();                                      // Включаем защиту от CSRF атак
app.UseCors("AllowAllOrigins");                            // Включаем CORS с политикой "AllowAllOrigins"

// Настраиваем маршрутизацию для Razor компонентов
app.MapRazorComponents<App>()                              // Маршрутизируем Razor компоненты
    .AddInteractiveServerRenderMode()                      // Добавляем режим рендеринга для серверных компонентов
    .AddInteractiveWebAssemblyRenderMode()                 // Добавляем режим рендеринга для WebAssembly компонентов
    .AddAdditionalAssemblies(typeof(BlazorWebAppAutoRendering.Client._Imports).Assembly);  // Добавляем дополнительные сборки для компонентов

app.MapControllers();                                      // Маршрутизируем контроллеры для обработки API запросов

app.Run();                                                 // Запускаем веб-приложение и начинаем обрабатывать запросы

// Определяем контроллер для обработки загрузки файлов
[Route("api/[controller]")]
[ApiController]
public class UploadController : ControllerBase
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

        // Определяем путь для сохранения файла
        var filePath = Path.Combine("C:", "Users", "user", "source", "repos", "BlazorWebAppAutoRendering", "BlazorWebAppAutoRendering", "BlazorWebAppAutoRendering", "wwwroot", "css", "wwwroot", "css", file.FileName);

        // Сохраняем файл на сервер
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Возвращаем путь к загруженному файлу в ответе
        return Ok(new { FilePath = filePath });
    }
}

// Сервис для работы с куками
public class CookieService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    // Конструктор, принимающий IHttpContextAccessor для доступа к текущему HTTP контексту
    public CookieService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    // Метод для установки куки
    public void SetCookie(string key, string value, int? expireTime)
    {
        CookieOptions option = new CookieOptions();

        // Устанавливаем время истечения куки
        if (expireTime.HasValue)
            option.Expires = DateTime.Now.AddMinutes(expireTime.Value);
        else
            option.Expires = DateTime.Now.AddDays(7);

        // Добавляем куки в ответ
        _httpContextAccessor.HttpContext.Response.Cookies.Append(key, value, option);
    }

    // Метод для получения значения куки
    public string GetCookie(string key)
    {
        // Возвращаем значение куки из запроса
        return _httpContextAccessor.HttpContext.Request.Cookies[key];
    }
}
