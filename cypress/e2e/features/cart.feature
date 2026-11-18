# language: es
@cart
Característica: Carro de compras
  Como cliente
  Quiero reunir los productos que pienso comprar
  Para revisarlos antes de pagar

  Antecedentes:
    Dado que inicié sesión como cliente "estándar"

  Escenario: Con el carro vacío no se muestra el contador
    Entonces no se muestra el contador del carro

  @smoke
  Escenario: Agregar productos actualiza el contador del carro
    Cuando agrego los siguientes productos al carro:
      | producto              |
      | Sauce Labs Backpack   |
      | Sauce Labs Bike Light |
    Entonces el contador del carro muestra 2
    Y los productos agregados aparecen marcados como en el carro

  Escenario: El carro muestra los productos elegidos con su cantidad y precio
    Cuando agrego los siguientes productos al carro:
      | producto                |
      | Sauce Labs Bolt T-Shirt |
      | Sauce Labs Onesie       |
    Y abro el carro
    Entonces el carro muestra cada producto elegido con cantidad 1 y su precio de catálogo

  Escenario: Cliente quita un producto del carro
    Dado que mi carro ya contiene:
      | producto                 |
      | Sauce Labs Backpack      |
      | Sauce Labs Fleece Jacket |
    Cuando abro el carro
    Y quito "Sauce Labs Backpack" del carro
    Entonces el carro solo contiene "Sauce Labs Fleece Jacket"
    Y el contador del carro muestra 1

  Escenario: El carro conserva su contenido mientras el cliente sigue comprando
    Cuando agrego "Sauce Labs Onesie" al carro
    Y abro el carro
    Y sigo comprando
    Entonces los productos agregados aparecen marcados como en el carro
    Y el contador del carro muestra 1
