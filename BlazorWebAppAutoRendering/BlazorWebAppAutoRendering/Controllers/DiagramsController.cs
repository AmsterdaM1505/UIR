using BlazorWebAppAutoRendering.Data;
using BlazorWebAppAutoRendering.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlazorWebAppAutoRendering.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiagramsController(AppDbContext context) : ControllerBase
{
    private readonly AppDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Diagram>>> GetAll() =>
        await _context.Diagrams.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Diagram>> Get(int id)
    {
        var item = await _context.Diagrams.FindAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Diagram diagram)
    {
        _context.Diagrams.Add(diagram);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = diagram.Id }, diagram);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Diagram diagram)
    {
        if (id != diagram.Id) return BadRequest();
        _context.Entry(diagram).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var diagram = await _context.Diagrams.FindAsync(id);
        if (diagram == null) return NotFound();
        _context.Diagrams.Remove(diagram);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // 🎯 Пример произвольного SQL-запроса
    [HttpPost("exec")]
    public async Task<IActionResult> ExecRaw([FromBody] string sql)
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync(sql);
            return Ok("✅ Executed successfully");
        }
        catch (Exception ex)
        {
            return BadRequest($"❌ Error: {ex.Message}");
        }
    }
}