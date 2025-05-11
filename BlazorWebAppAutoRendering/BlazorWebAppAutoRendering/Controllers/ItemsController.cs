using BlazorWebAppAutoRendering.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlazorWebAppAutoRendering.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController(AppDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Item>>> Get() =>
        await context.Items.ToListAsync();

    [HttpPost]
    public async Task<IActionResult> Post(Item item)
    {
        context.Items.Add(item);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, Item item)
    {
        if (id != item.Id) return BadRequest();
        context.Entry(item).State = EntityState.Modified;
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await context.Items.FindAsync(id);
        if (item == null) return NotFound();
        context.Items.Remove(item);
        await context.SaveChangesAsync();
        return NoContent();
    }
}