# language: es
@catalog
Característica: Catálogo de productos
  Como cliente con sesión iniciada
  Quiero explorar los productos disponibles
  Para encontrar lo que quiero comprar

  Antecedentes:
    Dado que inicié sesión como cliente "estándar"

  @smoke
  Escenario: El catálogo muestra todos los productos con su precio
    Entonces veo todos los productos de la tienda con su precio

  Esquema del escenario: Cliente ordena el catálogo por <opción>
    Cuando ordeno los productos por "<opción>"
    Entonces los productos quedan ordenados por <criterio> en orden <dirección>

    Ejemplos:
      | opción              | criterio | dirección   |
      | Name (A to Z)       | nombre   | ascendente  |
      | Name (Z to A)       | nombre   | descendente |
      | Price (low to high) | precio   | ascendente  |
      | Price (high to low) | precio   | descendente |

  Escenario: El detalle del producto coincide con el catálogo
    Cuando abro el detalle de "Sauce Labs Fleece Jacket"
    Entonces veo el nombre y el precio que muestra el catálogo para ese producto
    Cuando vuelvo a los productos
    Entonces veo el catálogo de productos

  @responsive
  Esquema del escenario: El catálogo se adapta a una pantalla de <dispositivo>
    Dado que uso una pantalla de "<dispositivo>"
    Entonces los productos se muestran en <grilla>
    Y la imagen de cada producto queda <posición> su descripción

    Ejemplos:
      | dispositivo | grilla     | posición          |
      | móvil       | 1 columna  | arriba de         |
      | tablet      | 1 columna  | a la izquierda de |
      | escritorio  | 2 columnas | a la izquierda de |

  @visual
  Escenario: La página del catálogo coincide con el diseño aprobado
    Entonces la página coincide con el diseño aprobado "catalog-page"
