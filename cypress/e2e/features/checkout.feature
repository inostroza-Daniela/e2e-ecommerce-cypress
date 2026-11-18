# language: es
@checkout
Característica: Proceso de compra
  Como cliente con productos en el carro
  Quiero completar mi compra
  Para que mi pedido quede registrado

  Antecedentes:
    Dado que inicié sesión como cliente "estándar"

  @smoke @e2e
  Escenario: Cliente compra productos del catálogo
    Cuando agrego los siguientes productos al carro:
      | producto                |
      | Sauce Labs Backpack     |
      | Sauce Labs Bolt T-Shirt |
    Y abro el carro
    Entonces el carro muestra cada producto elegido con cantidad 1 y su precio de catálogo
    Cuando paso al checkout
    Y envío mis datos de despacho
    Entonces el resumen del pedido muestra los productos elegidos
    Y el total del pedido es el subtotal más 8% de impuesto
    Cuando confirmo el pedido
    Entonces veo la confirmación del pedido
    Y no se muestra el contador del carro

  Esquema del escenario: Los datos de despacho exigen el <campo>
    Dado que mi carro ya contiene:
      | producto          |
      | Sauce Labs Onesie |
    Cuando abro el carro
    Y paso al checkout
    Y envío mis datos de despacho sin el "<campo>"
    Entonces veo el error de checkout "<mensaje>"
    Y sigo en el paso de datos de despacho

    Ejemplos:
      | campo         | mensaje                        |
      | nombre        | Error: First Name is required  |
      | apellido      | Error: Last Name is required   |
      | código postal | Error: Postal Code is required |

  Escenario: Cancelar el checkout mantiene el carro intacto
    Dado que mi carro ya contiene:
      | producto              |
      | Sauce Labs Bike Light |
    Cuando abro el carro
    Y paso al checkout
    Y cancelo el checkout
    Entonces el carro solo contiene "Sauce Labs Bike Light"
