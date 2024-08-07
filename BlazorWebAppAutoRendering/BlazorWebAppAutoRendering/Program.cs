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
using MudBlazor.Services;



// Создаем и настраиваем билдера веб-приложения
var builder = WebApplication.CreateBuilder(args);

// Добавляем сервисы в контейнер DI (Dependency Injection)
builder.Services.AddRazorComponents()                      // Добавляем поддержку Razor компонентов
    .AddInteractiveServerComponents()                      // Добавляем интерактивные серверные компоненты
    .AddInteractiveWebAssemblyComponents();                // Добавляем интерактивные компоненты для WebAssembly

builder.Services.AddCors();                                // Добавляем поддержку CORS (Cross-Origin Resource Sharing)
builder.Services.AddControllers();                         // Добавляем поддержку контроллеров для API
builder.Services.AddMudServices();

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


