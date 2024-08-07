// ���������� ����������� ������������ ����
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



// ������� � ����������� ������� ���-����������
var builder = WebApplication.CreateBuilder(args);

// ��������� ������� � ��������� DI (Dependency Injection)
builder.Services.AddRazorComponents()                      // ��������� ��������� Razor �����������
    .AddInteractiveServerComponents()                      // ��������� ������������� ��������� ����������
    .AddInteractiveWebAssemblyComponents();                // ��������� ������������� ���������� ��� WebAssembly

builder.Services.AddCors();                                // ��������� ��������� CORS (Cross-Origin Resource Sharing)
builder.Services.AddControllers();                         // ��������� ��������� ������������ ��� API
builder.Services.AddMudServices();

// ������ ���-����������
var app = builder.Build();

// ������������� HTTP �������� ��� ��������� ��������
if (app.Environment.IsDevelopment())                       // ���� ���������� �������� � ������ ����������
{
    app.UseWebAssemblyDebugging();                         // �������� ��������� ������� WebAssembly
}
else                                                       // ���� ���������� �������� � ������ ������������
{
    app.UseExceptionHandler("/Error");                     // �������� ���������� ������
    app.UseHsts();                                         // �������� HSTS (HTTP Strict Transport Security) � ����������� �� ���������
}

app.UseHttpsRedirection();                                 // �������������� HTTP ������� �� HTTPS

app.UseStaticFiles();                                      // ����������� ����������� �����

app.UseRouting();                                          // �������� ������������� ��������
app.UseAntiforgery();                                      // �������� ������ �� CSRF ����
app.UseCors("AllowAllOrigins");                            // �������� CORS � ��������� "AllowAllOrigins"

// ����������� ������������� ��� Razor �����������
app.MapRazorComponents<App>()                              // �������������� Razor ����������
    .AddInteractiveServerRenderMode()                      // ��������� ����� ���������� ��� ��������� �����������
    .AddInteractiveWebAssemblyRenderMode()                 // ��������� ����� ���������� ��� WebAssembly �����������
    .AddAdditionalAssemblies(typeof(BlazorWebAppAutoRendering.Client._Imports).Assembly);  // ��������� �������������� ������ ��� �����������

app.MapControllers();                                      // �������������� ����������� ��� ��������� API ��������

app.Run();                                                 // ��������� ���-���������� � �������� ������������ �������

// ���������� ���������� ��� ��������� �������� ������
[Route("api/[controller]")]
[ApiController]
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


