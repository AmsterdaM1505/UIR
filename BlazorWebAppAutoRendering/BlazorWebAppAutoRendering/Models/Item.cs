using System.ComponentModel.DataAnnotations.Schema;

namespace BlazorWebAppAutoRendering.Models;

[Table("items")]
public class Item
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;
}