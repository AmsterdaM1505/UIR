using System.ComponentModel.DataAnnotations.Schema;

namespace BlazorWebAppAutoRendering.Models;

[Table("diagrams")]
public class Diagram
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("schema")]
    public string Schema { get; set; } = string.Empty;
}