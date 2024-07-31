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

// ������� � ����������� ������� ���-����������
var builder = WebApplication.CreateBuilder(args);

// ��������� ������� � ��������� DI (Dependency Injection)
builder.Services.AddRazorComponents()                      // ��������� ��������� Razor �����������
    .AddInteractiveServerComponents()                      // ��������� ������������� ��������� ����������
    .AddInteractiveWebAssemblyComponents();                // ��������� ������������� ���������� ��� WebAssembly

builder.Services.AddCors();                                // ��������� ��������� CORS (Cross-Origin Resource Sharing)
builder.Services.AddControllers();                         // ��������� ��������� ������������ ��� API

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
public class UploadController : ControllerBase
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

        // ���������� ���� ��� ���������� �����
        var filePath = Path.Combine("C:", "Users", "user", "source", "repos", "BlazorWebAppAutoRendering", "BlazorWebAppAutoRendering", "BlazorWebAppAutoRendering", "wwwroot", "css", "wwwroot", "css", file.FileName);

        // ��������� ���� �� ������
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // ���������� ���� � ������������ ����� � ������
        return Ok(new { FilePath = filePath });
    }
}

// ������ ��� ������ � ������
public class CookieService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    // �����������, ����������� IHttpContextAccessor ��� ������� � �������� HTTP ���������
    public CookieService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    // ����� ��� ��������� ����
    public void SetCookie(string key, string value, int? expireTime)
    {
        CookieOptions option = new CookieOptions();

        // ������������� ����� ��������� ����
        if (expireTime.HasValue)
            option.Expires = DateTime.Now.AddMinutes(expireTime.Value);
        else
            option.Expires = DateTime.Now.AddDays(7);

        // ��������� ���� � �����
        _httpContextAccessor.HttpContext.Response.Cookies.Append(key, value, option);
    }

    // ����� ��� ��������� �������� ����
    public string GetCookie(string key)
    {
        // ���������� �������� ���� �� �������
        return _httpContextAccessor.HttpContext.Request.Cookies[key];
    }
}
